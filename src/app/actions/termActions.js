// /actions/termActions.js
"use server";

import { db } from "@/app/lib/db/mysql";
import { revalidatePath } from "next/cache";

/**
 * تابعی جدید و مخصوص پنل مدیریت برای دریافت ترم‌ها به همراه متادیتای آن‌ها
 * این تابع از JOIN برای بهینه‌سازی و دریافت تمام اطلاعات در یک کوئری استفاده می‌کند.
 */
export async function getTermsForAdmin() {
  try {
    const [data] = await db.query(`
      SELECT 
        t.ID, 
        t.name, 
        t.slug, 
        t.taxonomy, 
        tm.image_url, 
        tm.biography
      FROM terms AS t
      LEFT JOIN terms_metadata AS tm ON t.ID = tm.term_id
      WHERE t.taxonomy IN ('category', 'post_tag')
      ORDER BY t.name ASC
    `);
    return { success: true, data };
  } catch (error) {
    console.error("MySQL Error fetching admin terms:", error);
    return { success: false, message: "خطا در دریافت اطلاعات از دیتابیس." };
  }
}

/**
 * ایجاد یک ترم جدید به همراه متادیتا (بدون تغییر نسبت به کد قبلی)
 * نام تابع برای خوانایی بهتر تغییر کرده است
 */
export async function createTermWithMetadata(formData) {
  const { name, slug, taxonomy, image_url, biography } = formData;

  if (!name || !slug || !taxonomy) {
    return { success: false, message: "نام، اسلاگ و نوع ترم الزامی است." };
  }

  // برای جلوگیری از ID تکراری، یک ID جدید بر اساس بزرگترین ID موجود می‌سازیم
  const [maxIdResult] = await db.query("SELECT MAX(ID) as maxId FROM terms");
  const newTermId = (maxIdResult[0].maxId || 0) + 1;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      "INSERT INTO terms (ID, name, slug, taxonomy) VALUES (?, ?, ?, ?)",
      [newTermId, name, slug, taxonomy]
    );

    if (image_url || biography) {
      await connection.query(
        "INSERT INTO terms_metadata (term_id, image_url, biography) VALUES (?, ?, ?)",
        [newTermId, image_url || null, biography || null]
      );
    }

    await connection.commit();
    revalidatePath("/admin");
    return {
      success: true,
      message: "ترم با موفقیت ایجاد شد.",
      newTermId: newTermId,
    };
  } catch (error) {
    await connection.rollback();
    console.error("MySQL Error creating term:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return { success: false, message: "اسلاگ یا نام نمی‌تواند تکراری باشد." };
    }
    return { success: false, message: "خطا در ایجاد ترم جدید." };
  } finally {
    connection.release();
  }
}

/**
 * ویرایش یک ترم موجود و متادیتای آن (بدون تغییر نسبت به کد قبلی)
 * نام تابع برای خوانایی بهتر تغییر کرده است
 */
export async function updateTermWithMetadata(termId, formData) {
  const { name, slug, taxonomy, image_url, biography } = formData;

  if (!termId || !name || !slug || !taxonomy) {
    return { success: false, message: "داده‌های ورودی ناقص است." };
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      "UPDATE terms SET name = ?, slug = ?, taxonomy = ? WHERE ID = ?",
      [name, slug, taxonomy, termId]
    );

    const [meta] = await connection.query(
      "SELECT id FROM terms_metadata WHERE term_id = ?",
      [termId]
    );

    if (meta.length > 0) {
      await connection.query(
        "UPDATE terms_metadata SET image_url = ?, biography = ? WHERE term_id = ?",
        [image_url || null, biography || null, termId]
      );
    } else if (image_url || biography) {
      await connection.query(
        "INSERT INTO terms_metadata (term_id, image_url, biography) VALUES (?, ?, ?)",
        [termId, image_url || null, biography || null]
      );
    }

    await connection.commit();
    revalidatePath("/admin");
    return { success: true, message: "ترم با موفقیت به‌روزرسانی شد." };
  } catch (error) {
    await connection.rollback();
    console.error("MySQL Error updating term:", error);
    return { success: false, message: "خطا در به‌روزرسانی ترم." };
  } finally {
    connection.release();
  }
}
