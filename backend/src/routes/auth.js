const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../utils/db');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, full_name, bio } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM users WHERE username=? OR email=?', [username, email]);
    if (existing.length) return res.status(409).json({ message: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, full_name, bio) VALUES (?, ?, ?, ?, ?)',
      [username, email, hash, full_name || null, bio || null]
    );
    
    // Return complete user data
    const [newUser] = await pool.query(
      'SELECT id, username, email, full_name, bio, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: newUser[0]
    });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) return res.status(400).json({ message: 'Missing fields' });
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, username, email, password_hash FROM users WHERE username=? OR email=? LIMIT 1', [
      usernameOrEmail,
      usernameOrEmail,
    ]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
