import mysql from 'mysql2/promise'

export const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test',
  waitForConnections: true,
  connectionLimit: 100,
})