const express = require('express');
const { auth } = require('../middleware/auth');
const { getPool } = require('../utils/db');

const router = express.Router();

router.post('/:userId', auth(), async (req, res, next) => {
  try {
    const targetId = Number(req.params.userId);
    if (targetId === req.user.id) return res.status(400).json({ message: 'Cannot follow yourself' });
    const pool = getPool();
    await pool.query('INSERT IGNORE INTO followers (follower_id, following_id) VALUES (?, ?)', [req.user.id, targetId]);
    res.status(201).json({ message: 'Followed' });
  } catch (e) {
    next(e);
  }
});

router.delete('/:userId', auth(), async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM followers WHERE follower_id=? AND following_id=?', [req.user.id, req.params.userId]);
    res.json({ message: 'Unfollowed' });
  } catch (e) {
    next(e);
  }
});

router.get('/followers/:userId', auth(false), async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT f.follower_id AS user_id, u.username, f.created_at
       FROM followers f JOIN users u ON u.id=f.follower_id
       WHERE f.following_id=? ORDER BY f.created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get('/following/:userId', auth(false), async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT f.following_id AS user_id, u.username, f.created_at
       FROM followers f JOIN users u ON u.id=f.following_id
       WHERE f.follower_id=? ORDER BY f.created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
