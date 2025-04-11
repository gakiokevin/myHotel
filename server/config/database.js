import pkg from 'mariadb';
 

export const pool = pkg.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'my_hotel',
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true,
  queueLimit: 0
});

//process.env.DB_HOST || 'localhost' process.env.DB_USER || 'root'
