const express = require('express');
const bcrypt = require('bcryptjs');
const { getPool } = require('../utils/db');
const { auth } = require('../middleware/auth');
const { paginateParams } = require('../utils/helpers');

const router = express.Router();

router.get('/', auth(), async (req, res, next) => {
  try {
    const pool = getPool();
    const { pageSize, offset } = paginateParams(req.query);
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, bio, location, website, avatar_url, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    // Add post and follower counts
    for (let user of rows) {
      const [postCount] = await pool.query('SELECT COUNT(*) as count FROM posts WHERE user_id = ?', [user.id]);
      const [followerCount] = await pool.query('SELECT COUNT(*) as count FROM followers WHERE following_id = ?', [user.id]);
      const [followingCount] = await pool.query('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?', [user.id]);
      
      user.posts_count = postCount[0].count;
      user.followers_count = followerCount[0].count;
      user.following_count = followingCount[0].count;
    }
    
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post('/', auth(), async (req, res, next) => {
  try {
    const { username, email, password, full_name, bio, location, website, avatar_url } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    const pool = getPool();
    
    // Check if username or email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name, bio, location, website, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name || null, bio || null, location || null, website || null, avatar_url || null]
    );
    
    // Return the created user (without password)
    const [newUser] = await pool.query(
      'SELECT id, username, email, full_name, bio, location, website, avatar_url, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newUser[0]);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', auth(), async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, bio, location, website, avatar_url, created_at FROM users WHERE id=?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', auth(), async (req, res, next) => {
  try {
    const { username, email, full_name, bio, location, website, avatar_url } = req.body;
    const pool = getPool();
    
    // Check if new username or email conflicts with other users
    if (username || email) {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username, email, req.params.id]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
    }
    
    await pool.query(
      'UPDATE users SET username=?, email=?, full_name=?, bio=?, location=?, website=?, avatar_url=? WHERE id=?',
      [username, email, full_name || null, bio || null, location || null, website || null, avatar_url || null, req.params.id]
    );
    
    // Return updated user
    const [updated] = await pool.query(
      'SELECT id, username, email, full_name, bio, location, website, avatar_url, created_at FROM users WHERE id=?',
      [req.params.id]
    );
    
    res.json(updated[0]);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', auth(), async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
