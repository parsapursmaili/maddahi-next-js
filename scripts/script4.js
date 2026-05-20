import mysql from "mysql2/promise";

let dbInstance;

export const getDb = async () => {
  if (!dbInstance) {
    dbInstance = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "besooyeto_db", // نام دیتابیس شما
      waitForConnections: true,
      connectionLimit: 100,
    });
  }
  return dbInstance;
};

export const addIndexes = async () => {
  const db = await getDb();
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    console.log("در حال اتصال به دیتابیس و اضافه کردن ایندکس‌ها...");

    // Indexes for 'comments' table
    await connection.execute(
      `ALTER TABLE comments ADD INDEX IF NOT EXISTS idx_status (status);`
    );

    // Indexes for 'posts' table
    // 'name' (اسلاگ) معمولاً باید یونیک باشد
    await connection.execute(
      `ALTER TABLE posts ADD UNIQUE INDEX IF NOT EXISTS uq_name (name);`
    );
    await connection.execute(
      `ALTER TABLE posts ADD INDEX IF NOT EXISTS idx_status (status);`
    );
    await connection.execute(
      `ALTER TABLE posts ADD INDEX IF NOT EXISTS idx_type (type);`
    );
    await connection.execute(
      `ALTER TABLE posts ADD INDEX IF NOT EXISTS idx_date (date);`
    );
    await connection.execute(
      `ALTER TABLE posts ADD INDEX IF NOT EXISTS idx_author (author);`
    );
    await connection.execute(
      `ALTER TABLE posts ADD INDEX IF NOT EXISTS idx_view (view);`
    );

    // Indexes for 'soogname' table
    // 'url' (اسلاگ) معمولاً باید یونیک باشد
    await connection.execute(
      `ALTER TABLE soogname ADD UNIQUE INDEX IF NOT EXISTS uq_url (url);`
    );
    await connection.execute(
      `ALTER TABLE soogname ADD INDEX IF NOT EXISTS idx_status (status);`
    );
    await connection.execute(
      `ALTER TABLE soogname ADD INDEX IF NOT EXISTS idx_date (date);`
    );
    await connection.execute(
      `ALTER TABLE soogname ADD INDEX IF NOT EXISTS idx_type (type);`
    );

    // Indexes for 'terms' table
    // 'slug' معمولاً باید یونیک باشد
    await connection.execute(
      `ALTER TABLE terms ADD UNIQUE INDEX IF NOT EXISTS uq_slug (slug);`
    );
    await connection.execute(
      `ALTER TABLE terms ADD INDEX IF NOT EXISTS idx_name (name);`
    );
    await connection.execute(
      `ALTER TABLE terms ADD INDEX IF NOT EXISTS idx_taxonomy (taxonomy);`
    );

    await connection.commit();
    console.log("عملیات اضافه کردن ایندکس‌ها با موفقیت به پایان رسید.");
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("خطا در هنگام اضافه کردن ایندکس‌ها:", error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

addIndexes();
