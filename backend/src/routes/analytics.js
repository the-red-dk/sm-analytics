const express = require('express');
const { auth } = require('../middleware/auth');
const { getPool } = require('../utils/db');

const router = express.Router();

router.get('/summary', auth(false), async (req, res, next) => {
  try {
    const pool = getPool();
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) AS total_users FROM users');
    const [[{ total_posts }]] = await pool.query('SELECT COUNT(*) AS total_posts FROM posts');
    const [[{ total_likes }]] = await pool.query('SELECT COUNT(*) AS total_likes FROM likes');
    const [[{ total_comments }]] = await pool.query('SELECT COUNT(*) AS total_comments FROM comments');

    const [[{ this_week }]] = await pool.query(
      `SELECT COALESCE(SUM(c),0) AS this_week FROM (
         SELECT COUNT(*) c FROM likes WHERE created_at >= (CURRENT_DATE - INTERVAL 6 DAY)
         UNION ALL
         SELECT COUNT(*) c FROM comments WHERE created_at >= (CURRENT_DATE - INTERVAL 6 DAY)
       ) t`
    );
    const [[{ last_week }]] = await pool.query(
      `SELECT COALESCE(SUM(c),0) AS last_week FROM (
         SELECT COUNT(*) c FROM likes WHERE created_at < (CURRENT_DATE - INTERVAL 6 DAY) AND created_at >= (CURRENT_DATE - INTERVAL 13 DAY)
         UNION ALL
         SELECT COUNT(*) c FROM comments WHERE created_at < (CURRENT_DATE - INTERVAL 6 DAY) AND created_at >= (CURRENT_DATE - INTERVAL 13 DAY)
       ) t`
    );

    const engagementRate = total_posts ? (((total_likes + total_comments) / total_posts) * 100) : 0;

    res.json({
      totals: {
        totalUsers: Number(total_users),
        totalPosts: Number(total_posts),
        totalLikes: Number(total_likes),
        totalComments: Number(total_comments),
        engagementRate: Number(engagementRate.toFixed(1)),
      },
      weeklyEngagement: {
        thisWeek: { likesAndComments: Number(this_week) },
        lastWeek: { likesAndComments: Number(last_week) },
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get('/engagement', auth(false), async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT DATE(p.created_at) AS date,
              COUNT(p.id) AS posts,
              COALESCE(SUM(COALESCE(l.likes_count,0)),0) AS likes,
              COALESCE(SUM(COALESCE(c.comments_count,0)),0) AS comments
       FROM posts p
       LEFT JOIN post_likes_agg l ON l.post_id=p.id
       LEFT JOIN post_comments_agg c ON c.post_id=p.id
       GROUP BY DATE(p.created_at)
       ORDER BY date ASC`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get('/content-performance', auth(false), async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT p.id AS post_id, u.username, p.content,
              COALESCE(l.likes_count,0) AS likes,
              COALESCE(c.comments_count,0) AS comments,
              (COALESCE(l.likes_count,0) + COALESCE(c.comments_count,0)) AS engagement
       FROM posts p
       JOIN users u ON u.id=p.user_id
       LEFT JOIN post_likes_agg l ON l.post_id=p.id
       LEFT JOIN post_comments_agg c ON c.post_id=p.id
       ORDER BY engagement DESC, p.created_at DESC
       LIMIT 100`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get('/user-growth', auth(false), async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(id) AS new_users FROM users GROUP BY DATE(created_at) ORDER BY date ASC`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post('/log', auth(), async (req, res, next) => {
  try {
    const pool = getPool();
    const { metric_name, metric_value, notes } = req.body;
    if (!metric_name) return res.status(400).json({ message: 'metric_name required' });
    const [result] = await pool.query(
      'INSERT INTO analytics_logs (metric_name, metric_value, notes, created_by) VALUES (?, ?, ?, ?)',
      [metric_name, metric_value || null, notes || null, req.user.id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
