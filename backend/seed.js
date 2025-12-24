const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * Database Seeding Script
 * 
 * This script will:
 * 1. Connect to MySQL server
 * 2. Create the sm_analytics database
 * 3. Create all tables with proper schema
 * 4. Apply schema updates (including followee_id -> following_id change)
 * 5. Insert sample data
 * 
 * Usage: node seed.js
 * 
 * Configuration:
 * Set environment variables or modify the defaults below:
 * - DB_HOST (default: localhost)
 * - DB_PORT (default: 3306)
 * - DB_USER (default: root)
 * - DB_PASSWORD (default: empty string)
 */

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function executeSqlFile(connection, filePath, description) {
  console.log(`\n📄 Executing ${description}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split by semicolon and execute each statement
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  let successCount = 0;
  let skipCount = 0;
  
  for (const statement of statements) {
    try {
      await connection.execute(statement);
      successCount++;
    } catch (err) {
      // Ignore certain expected errors
      if (err.message.includes('already exists') || 
          err.message.includes('Duplicate column name') ||
          err.message.includes('Unknown column')) {
        skipCount++;
      } else {
        console.warn(`⚠️  Warning: ${err.message.substring(0, 100)}`);
      }
    }
  }
  
  console.log(`✅ ${description} complete: ${successCount} statements executed, ${skipCount} skipped`);
  return true;
}

async function verifyDatabase(connection) {
  console.log('\n🔍 Verifying database setup...');
  
  try {
    await connection.execute('USE sm_analytics');
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`✅ Tables created (${tableNames.length}):`, tableNames.join(', '));
    
    // Check sample data
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [postCount] = await connection.execute('SELECT COUNT(*) as count FROM posts');
    const [commentCount] = await connection.execute('SELECT COUNT(*) as count FROM comments');
    const [likeCount] = await connection.execute('SELECT COUNT(*) as count FROM likes');
    const [followerCount] = await connection.execute('SELECT COUNT(*) as count FROM followers');
    
    console.log('\n📊 Sample data inserted:');
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Posts: ${postCount[0].count}`);
    console.log(`   Comments: ${commentCount[0].count}`);
    console.log(`   Likes: ${likeCount[0].count}`);
    console.log(`   Followers: ${followerCount[0].count}`);
    
    return true;
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    return false;
  }
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding process...');
  console.log('⚙️  Configuration:', {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password ? '***' : '(empty)'
  });
  
  let connection = null;
  
  try {
    // Connect to MySQL server
    console.log('\n🔌 Connecting to MySQL server...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL server');
    
    // Execute main schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    await executeSqlFile(connection, schemaPath, 'schema.sql (creating database and tables)');
    
    // Execute schema updates
    const updateSchemaPath = path.join(__dirname, '..', 'database', 'update_schema.sql');
    if (fs.existsSync(updateSchemaPath)) {
      await executeSqlFile(connection, updateSchemaPath, 'update_schema.sql (applying updates)');
    } else {
      console.log('\nℹ️  No update_schema.sql found, skipping updates');
    }
    
    // Verify everything worked
    const verified = await verifyDatabase(connection);
    
    if (verified) {
      console.log('\n✨ Database seeding completed successfully! ✨');
      console.log('\nYou can now start the application with:');
      console.log('  cd backend && npm start');
    } else {
      console.log('\n⚠️  Database seeding completed with warnings');
    }
    
  } catch (err) {
    console.error('\n❌ Error during database seeding:', err.message);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the seeding process
if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
