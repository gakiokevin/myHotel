import bcrypt from 'bcryptjs'
import jwt from  'jsonwebtoken'
import {pool} from '../config/database.js'

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
   
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    // Get user from database
    const users = await pool.execute(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );
    if (!users.length) {
     
     
      return res.status(404).json({ error: 'email does not exists!' });
    }

    const matchUser = users[0]
    
    const validPassword = await bcrypt.compare(password, matchUser.password_hash);

    if (!validPassword) {
    
      return res.status(401).json({ error: ' incorrect password' });
    }

    
    let user = {
      id: matchUser.id,
      email: matchUser.email,
      name:`${matchUser.first_name} ${matchUser.last_name}`,
      role: matchUser.role,
    }

    // Generate token
    const token = jwt.sign(
     {user},
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      user,
      token
      
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const verifUser = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    res.json(user); 
  });
}

export const addEmployee = async (req, res) => {
  const {email, name, password, role } = req.body;
  
  
  try { 
    console.log(email,name,password,role)
    // Validate input
    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existingUsers = await pool.execute(
      'SELECT id FROM Users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'email already exists' });
    }
    const [first_name,last_name] =name.split(' ')
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.execute(
      'INSERT INTO Users (first_name,last_name, email,password_hash,role) VALUES (?, ?, ?, ?, ?)',
      [first_name,last_name,email, hashedPassword, role]
    );
    const insertId = Number(result.insertId);
    res.status(201).json({
     
      id: insertId,
     
    });
  } catch (error) {
    console.log('Add employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getEmployees = async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, CONCAT(first_name, " ", last_name) AS name, email, role FROM Users'
    );

    if (!users.length) {
      return res.status(404).json({ message: 'No employees found' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
