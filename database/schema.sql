-- Social Media Analytics Database Schema
-- MySQL 8.0+

DROP DATABASE IF EXISTS sm_analytics;
CREATE DATABASE sm_analytics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sm_analytics;

-- 1. Users
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  bio TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Posts
CREATE TABLE posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  content TEXT,
  media_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Comments
CREATE TABLE comments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_comments_post_created (post_id, created_at)
) ENGINE=InnoDB;

-- 4. Likes
CREATE TABLE likes (
  post_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id),
  CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_likes_post_created (post_id, created_at)
) ENGINE=InnoDB;

-- 5. Followers
CREATE TABLE followers (
  follower_id BIGINT UNSIGNED NOT NULL,
  followee_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, followee_id),
  CONSTRAINT fk_followers_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_followers_followee FOREIGN KEY (followee_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_followers_followee_created (followee_id, created_at)
) ENGINE=InnoDB;

-- 6. Analytics Logs
CREATE TABLE analytics_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(18,4),
  notes TEXT,
  created_by BIGINT UNSIGNED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_analytics_logs_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_analytics_logs_metric_time (metric_name, created_at)
) ENGINE=InnoDB;

-- Helpful indices for analytics
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);
CREATE INDEX idx_users_created ON users(created_at);

-- Aggregation helper views
CREATE OR REPLACE VIEW post_likes_agg AS
SELECT l.post_id, COUNT(*) AS likes_count
FROM likes l
GROUP BY l.post_id;

CREATE OR REPLACE VIEW post_comments_agg AS
SELECT c.post_id, COUNT(*) AS comments_count
FROM comments c
GROUP BY c.post_id;

-- Engagement per day view
CREATE OR REPLACE VIEW daily_engagement AS
SELECT
  d.date,
  COALESCE(p.posts, 0) AS posts,
  COALESCE(l.likes, 0) AS likes,
  COALESCE(cm.comments, 0) AS comments
FROM (
  SELECT DATE(created_at) AS date FROM posts
  UNION
  SELECT DATE(created_at) AS date FROM likes
  UNION
  SELECT DATE(created_at) AS date FROM comments
) d
LEFT JOIN (
  SELECT DATE(created_at) AS date, COUNT(*) AS posts FROM posts GROUP BY DATE(created_at)
) p ON p.date = d.date
LEFT JOIN (
  SELECT DATE(created_at) AS date, COUNT(*) AS likes FROM likes GROUP BY DATE(created_at)
) l ON l.date = d.date
LEFT JOIN (
  SELECT DATE(created_at) AS date, COUNT(*) AS comments FROM comments GROUP BY DATE(created_at)
) cm ON cm.date = d.date
ORDER BY d.date;

-- Sample data
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('alice', 'alice@example.com', '$2a$10$wQpQppYtP3o6R1b8eHcQ7O2y2nMuWmT1yU5D0tKp1NnqVnQF76D8y', 'Alice Johnson', 'Coffee and code'),
('bob', 'bob@example.com', '$2a$10$wQpQppYtP3o6R1b8eHcQ7O2y2nMuWmT1yU5D0tKp1NnqVnQF76D8y', 'Bob Smith', 'Traveler'),
('carol', 'carol@example.com', '$2a$10$wQpQppYtP3o6R1b8eHcQ7O2y2nMuWmT1yU5D0tKp1NnqVnQF76D8y', 'Carol White', 'Photographer');
-- Note: the sample password hash corresponds to 'password123'

INSERT INTO posts (user_id, content, media_url, created_at) VALUES
(1, 'Hello world! First post', NULL, NOW() - INTERVAL 5 DAY),
(2, 'Sunset at the beach', 'https://pics.example/sunset.jpg', NOW() - INTERVAL 4 DAY),
(1, 'Working on a new project', NULL, NOW() - INTERVAL 3 DAY),
(3, 'Check out my latest photo', 'https://pics.example/photo.jpg', NOW() - INTERVAL 2 DAY),
(2, 'Any book recommendations?', NULL, NOW() - INTERVAL 1 DAY);

INSERT INTO comments (post_id, user_id, content, created_at) VALUES
(1, 2, 'Welcome!', NOW() - INTERVAL 5 DAY + INTERVAL 1 HOUR),
(2, 1, 'Beautiful view!', NOW() - INTERVAL 4 DAY + INTERVAL 2 HOUR),
(3, 3, 'Good luck!', NOW() - INTERVAL 3 DAY + INTERVAL 30 MINUTE),
(4, 1, 'Nice shot!', NOW() - INTERVAL 2 DAY + INTERVAL 15 MINUTE),
(5, 3, 'Try sci-fi!', NOW() - INTERVAL 1 DAY + INTERVAL 1 HOUR);

INSERT INTO likes (post_id, user_id, created_at) VALUES
(1, 3, NOW() - INTERVAL 5 DAY + INTERVAL 2 HOUR),
(2, 1, NOW() - INTERVAL 4 DAY + INTERVAL 3 HOUR),
(2, 3, NOW() - INTERVAL 4 DAY + INTERVAL 4 HOUR),
(3, 2, NOW() - INTERVAL 3 DAY + INTERVAL 1 HOUR),
(4, 2, NOW() - INTERVAL 2 DAY + INTERVAL 2 HOUR),
(5, 1, NOW() - INTERVAL 1 DAY + INTERVAL 2 HOUR);

INSERT INTO followers (follower_id, followee_id, created_at) VALUES
(1, 2, NOW() - INTERVAL 10 DAY),
(2, 1, NOW() - INTERVAL 9 DAY),
(3, 1, NOW() - INTERVAL 8 DAY),
(1, 3, NOW() - INTERVAL 7 DAY);

-- A couple analytics log examples
INSERT INTO analytics_logs (metric_name, metric_value, notes, created_by) VALUES
('daily_active_users', 2, 'Sample note', 1),
('avg_engagement_per_post', 3.5, 'Sample note', 2);
