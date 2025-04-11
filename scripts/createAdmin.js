import bcrypt from 'bcryptjs'
import { pool } from '../server/config/database.js';

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin100', 10);
    await pool.execute(
      'INSERT INTO Users (first_name,last_name, email,password_hash,role) VALUES (?, ?, ?, ?, ?)',
      ['kevin', 'gakio','gakiokevin5@gmail.com',hashedPassword, 'owner']
    );
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

