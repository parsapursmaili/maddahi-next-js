import mysql from "mysql2/promise";

export const db = await mysql.createPool({
  host: process.env.DB_HOSTNAME || "localhost",
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "test",
  waitForConnections: true,
  connectionLimit: 100,
});
