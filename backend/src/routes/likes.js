const express = require('express');
const { auth } = require('../middleware/auth');
const { getPool } = require('../utils/db');

const router = express.Router();

router.post('/post/:postId', auth(), async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.query('INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)', [req.params.postId, req.user.id]);
    res.status(201).json({ message: 'Liked' });
  } catch (e) {
    next(e);
  }
});

router.delete('/post/:postId', auth(), async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM likes WHERE post_id=? AND user_id=?', [req.params.postId, req.user.id]);
    res.json({ message: 'Unliked' });
  } catch (e) {
    next(e);
  }
});

router.get('/post/:postId', auth(false), async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT l.user_id, u.username, l.created_at
       FROM likes l JOIN users u ON u.id=l.user_id
       WHERE l.post_id=? ORDER BY l.created_at DESC`,
      [req.params.postId]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
