import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  try {
    // تنظیمات اتصال به دیتابیس
    const connection = await mysql.createConnection({
         host: '89.39.208.179',
        user: 'pleshhsz_test',
        password: 'parsap110',
        database: 'pleshhsz_test',
        waitForConnections: true,
        connectionLimit: 100,
        port: 3306, // پورت پیش‌فرض MySQL
    });

    // تست اتصال با یک کوئری ساده
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    await connection.end(); // بستن اتصال

    // اگر اتصال موفق باشد
    res.status(200).json({ message: 'اتصال به دیتابیس موفق بود!', result: rows });
  } catch (error) {
    // در صورت خطا
    res.status(500).json({ message: 'خطا در اتصال به دیتابیس', error: error.message });
  }
}