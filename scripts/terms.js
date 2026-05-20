import mysql from "mysql2/promise";

export const createDbPool = async () => {
  const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "test",
    waitForConnections: true,
    connectionLimit: 100,
  });
  console.log("Database pool created successfully.");
  return pool;
};

let dbInstance;
export const getDb = async () => {
  if (!dbInstance) {
    dbInstance = await createDbPool();
  }
  return dbInstance;
};

export const terms = async () => {
  const db = await getDb();
  try {
    // 1. اصلاح: حذف کامای اضافی در انتهای لیست SELECT
    let [rows] = await db.query(`
      SELECT
        wt.term_id,
        wt.name,
        wt.slug,
        wtt.taxonomy 
      FROM
        wp_terms AS wt
      INNER JOIN
        wp_term_taxonomy AS wtt ON wt.term_id = wtt.term_id
    `);

    if (rows.length === 0) {
      console.log("No terms found to sync.");
      return;
    }

    const valuesToInsert = rows.map((row) => [
      row.term_id,
      row.name,
      row.slug,
      row.taxonomy,
    ]);

    await db.query(
      `
      REPLACE INTO terms (ID, name, slug, taxonomy) VALUES ?
      `,
      [valuesToInsert] // valuesToInsert باید به عنوان یک آرایه در داخل یک آرایه دیگر فرستاده شود
    );

    console.log(`Successfully replaced ${rows.length} terms.`);
  } catch (error) {
    console.error("Error syncing terms:", error);
    throw error;
  }
};

terms();
