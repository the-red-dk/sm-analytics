const express = require('express');
const { auth } = require('../middleware/auth');
const { getPool } = require('../utils/db');
const { paginateParams } = require('../utils/helpers');

const router = express.Router();

router.get('/', auth(false), async (req, res, next) => {
  try {
    const pool = getPool();
    const { pageSize, offset } = paginateParams(req.query);
    const [rows] = await pool.query(
      `SELECT p.id, p.user_id, p.content, p.image_url, p.status, p.created_at,
              u.username, u.full_name, u.avatar_url,
              COALESCE(l.likes_count,0) AS likes_count, COALESCE(c.comments_count,0) AS comments_count
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN post_likes_agg l ON l.post_id = p.id
       LEFT JOIN post_comments_agg c ON c.post_id = p.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    
    // Format the response to include user object
    const formattedRows = rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      content: row.content,
      image_url: row.image_url,
      status: row.status || 'active',
      created_at: row.created_at,
      likes_count: row.likes_count,
      comments_count: row.comments_count,
      user: {
        username: row.username,
        full_name: row.full_name,
        avatar_url: row.avatar_url
      }
    }));
    
    res.json(formattedRows);
  } catch (e) {
    next(e);
  }
});

router.get('/user/:userId', auth(false), async (req, res, next) => {
  try {
    const pool = getPool();
    const { pageSize, offset } = paginateParams(req.query);
    const [rows] = await pool.query(
      `SELECT p.* FROM posts p WHERE p.user_id=? ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [req.params.userId, pageSize, offset]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post('/', auth(), async (req, res, next) => {
  try {
    const { content, image_url, status } = req.body;
    if (!content && !image_url) return res.status(400).json({ message: 'content or image_url required' });
    
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, content, image_url, status) VALUES (?, ?, ?, ?)', 
      [req.user.id, content || null, image_url || null, status || 'active']
    );
    
    // Return the created post with user info
    const [newPost] = await pool.query(
      `SELECT p.id, p.user_id, p.content, p.image_url, p.status, p.created_at,
              u.username, u.full_name, u.avatar_url
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = ?`,
      [result.insertId]
    );
    
    const formattedPost = {
      ...newPost[0],
      likes_count: 0,
      comments_count: 0,
      user: {
        username: newPost[0].username,
        full_name: newPost[0].full_name,
        avatar_url: newPost[0].avatar_url
      }
    };
    
    res.status(201).json(formattedPost);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', auth(), async (req, res, next) => {
  try {
    const { content, image_url, status } = req.body;
    const pool = getPool();
    await pool.query(
      'UPDATE posts SET content=?, image_url=?, status=? WHERE id=? AND user_id=?', 
      [content || null, image_url || null, status || 'active', req.params.id, req.user.id]
    );
    
    // Return updated post
    const [updated] = await pool.query(
      `SELECT p.id, p.user_id, p.content, p.image_url, p.status, p.created_at,
              u.username, u.full_name, u.avatar_url
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = ?`,
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
    await pool.query('DELETE FROM posts WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
