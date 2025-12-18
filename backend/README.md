# Social Media Analytics - Backend

Node.js (Express) + MySQL backend for the Social Media Analytics Dashboard.

## Prerequisites
- Node.js 18+
- MySQL 8.0+

## Setup

### Quick Setup (Automated)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the database seeding script:
   ```bash
   node seed.js
   ```
   The script will automatically:
   - Connect to MySQL (localhost:3306 by default)
   - Create the `sm_analytics` database
   - Create all tables with proper schema
   - Apply schema updates
   - Insert sample data

3. Copy `.env.example` to `.env` and configure if needed
4. Start the server:
   ```bash
   npm run dev
   ```

### Manual Setup
1. Create database and sample data using the SQL scripts:
   - Open MySQL Workbench and run `../database/schema.sql`
   - Then run `../database/update_schema.sql`
2. Copy `.env.example` to `.env` and set DB credentials and JWT secret
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Environment Variables
Set these environment variables before running `seed.js` if needed:
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 3306)
- `DB_USER` (default: root)
- `DB_PASSWORD` (default: empty string)

The API runs at http://localhost:4000 by default.

## Endpoints (quick overview)
- Auth: POST /api/auth/register, POST /api/auth/login
- Users: GET /api/users, GET/PUT/DELETE /api/users/:id
- Posts: GET /api/posts, GET /api/posts/user/:userId, POST /api/posts, PUT/DELETE /api/posts/:id
- Comments: GET /api/comments/post/:postId, POST /api/comments/post/:postId, DELETE /api/comments/:id
- Likes: POST/DELETE /api/likes/post/:postId, GET /api/likes/post/:postId
- Followers: POST/DELETE /api/followers/:userId, GET /api/followers/followers/:userId, GET /api/followers/following/:userId
- Analytics: GET /api/analytics/engagement, GET /api/analytics/content-performance, GET /api/analytics/user-growth, POST /api/analytics/log

Use Authorization: Bearer <token> for protected routes.

## Power BI integration
- Use the MySQL connector in Power BI Desktop.
- Connect to the `sm_analytics` database.
- Recommended tables/views to import:
  - users, posts, comments, likes, followers, analytics_logs
  - Views: `post_likes_agg`, `post_comments_agg`, `daily_engagement`
- Example useful relationships:
  - posts.user_id -> users.id
  - comments.post_id -> posts.id; comments.user_id -> users.id
  - likes.post_id -> posts.id; likes.user_id -> users.id
  - followers.follower_id -> users.id; followers.followee_id -> users.id
- Sample visuals:
  - Area/line chart of `daily_engagement` (date vs posts/likes/comments)
  - Bar chart: top posts by engagement using `content-performance` API data or aggregations in Power BI
  - User growth: users by date (users.created_at)

## Notes
- Sample user password in seed data is `password123`.
- Update `.env` `JWT_SECRET` in production.