import pkg from 'mariadb';
 

export const pool = pkg.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true,
  queueLimit: 0
});

//process.env.DB_HOST || 'localhost' process.env.DB_USER || 'root'
