const express = require('express');
const { auth } = require('../middleware/auth');
const { getPool } = require('../utils/db');
const { paginateParams } = require('../utils/helpers');

const router = express.Router();

router.get('/post/:postId', auth(false), async (req, res, next) => {
  try {
    const pool = getPool();
    const { pageSize, offset } = paginateParams(req.query);
    const [rows] = await pool.query(
      `SELECT c.id, c.post_id, c.user_id, u.username, c.content, c.created_at
       FROM comments c JOIN users u ON u.id=c.user_id
       WHERE c.post_id=? ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [req.params.postId, pageSize, offset]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post('/post/:postId', auth(), async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'content required' });
    const pool = getPool();
    const [result] = await pool.query('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [
      req.params.postId,
      req.user.id,
      content,
    ]);
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', auth(), async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM comments WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
