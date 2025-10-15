-- Add missing columns to posts table
ALTER TABLE posts 
ADD COLUMN image_url VARCHAR(500) AFTER media_url,
ADD COLUMN status ENUM('active', 'inactive', 'draft') DEFAULT 'active' AFTER image_url;

-- Copy media_url to image_url for existing records
UPDATE posts SET image_url = media_url WHERE media_url IS NOT NULL;

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN location VARCHAR(255) AFTER bio,
ADD COLUMN website VARCHAR(500) AFTER location,
ADD COLUMN avatar_url VARCHAR(500) AFTER website;

-- Update followers table to use correct column names
-- The schema has followee_id but the backend expects following_id
ALTER TABLE followers CHANGE COLUMN followee_id following_id BIGINT UNSIGNED NOT NULL;