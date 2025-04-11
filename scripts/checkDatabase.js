import { pool } from "../server/config/database.js";
import fs from 'fs/promises'

async function checkDatabase() {
  try {
    // Test connection
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    const sqlScript = await fs.readFile('s.sql', 'utf8');
    await connection.query(sqlScript); 
    console.log('All tables created!');
    
  } catch (error) {
    console.error('Database check failed:', error);
    process.exit(1);
  }
}

checkDatabase();


//  // Check if users table exists and has the admin user
//  const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
//  if (users.length > 0) {
//    console.log(' Admin user exists');
//    console.log('Username:', users[0].username);
//    console.log('Role:', users[0].role);
//  } else {
//    console.log(' Admin user not found');
//  }

//  connection.release();
//  process.exit(0);


