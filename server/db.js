import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'gameboxd',
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
