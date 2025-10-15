const mysql = require('mysql2/promise');

let pool;

function getConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sm_analytics',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

async function initDb() {
  if (pool) return pool;
  pool = mysql.createPool(getConfig());
  // quick probe
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log('MySQL pool initialized');
  return pool;
}

function getPool() {
  if (!pool) throw new Error('DB not initialized');
  return pool;
}

module.exports = { initDb, getPool };
