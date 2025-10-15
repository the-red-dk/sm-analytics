const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('Setting up database...');
  
  // Try different common passwords
  const passwords = ['', 'root', 'password', 'admin', 'mysql'];
  let connection = null;
  
  for (const password of passwords) {
    try {
      console.log(`Trying password: ${password || '(empty)'}`);
      connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: password
      });
      console.log(`✓ Connected with password: ${password || '(empty)'}`);
      
      // Update .env file with working password
      const envPath = path.join(__dirname, '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${password}`);
      fs.writeFileSync(envPath, envContent);
      console.log('✓ Updated .env with working password');
      break;
    } catch (err) {
      console.log(`✗ Failed with password: ${password || '(empty)'}`);
      continue;
    }
  }
  
  if (!connection) {
    console.error('Could not connect to MySQL. Please check your MySQL installation and credentials.');
    process.exit(1);
  }
  
  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (err) {
          if (!err.message.includes('already exists')) {
            console.warn(`Warning executing: ${statement.substring(0, 50)}... - ${err.message}`);
          }
        }
      }
    }
    
    console.log('✓ Database schema imported successfully');
    
    // Verify tables
    await connection.execute('USE sm_analytics');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✓ Tables created:', tables.map(t => Object.values(t)[0]).join(', '));
    
  } catch (err) {
    console.error('Error setting up database:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  
  console.log('✓ Database setup complete!');
}

setupDatabase().catch(console.error);