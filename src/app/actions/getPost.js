"use server";

import { db } from "@/app/lib/db/mysql";

export default async function getPosts(params) {
  const {
    page = 1,
    maddah = 0,
    monasebat = 0,
    rand = 0,
    s: search = null,
    terms = 0,
  } = params;

  let orderby = "";
  switch (rand) {
    case 0:
      orderby = "ORDER BY p.date DESC";
      break;
    case 1:
      orderby = "ORDER BY RAND()";
      break;
    case 2:
      orderby = "ORDER BY view DESC";
      break;
    default:
      orderby = "ORDER BY RAND()";
      break;
  }

  const limit = 20;
  let skip = 0;
  if (rand === 0 || rand === 2) {
    skip = (page - 1) * limit;
  }

  try {
    let where = `WHERE type = 'post' `;
    let values = [];

    if (search) {
      where += ` AND (title LIKE ? OR content LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }
    if (maddah) {
      where += ` AND ID IN (SELECT object_id FROM wp_term_relationships WHERE term_taxonomy_id = ?)`;
      values.push(maddah);
    }
    if (monasebat) {
      where += ` AND ID IN (SELECT object_id FROM wp_term_relationships WHERE term_taxonomy_id = ?)`;
      values.push(monasebat);
    }

    const countQuery = `SELECT COUNT(*) as total FROM posts ${where}`;
    const totalResult = await db.query(countQuery, values);
    const total = totalResult[0][0].total;

    const postsQuery = `
      SELECT p.ID, p.title as post_title, p.link, p.thumbnail as thumb
      FROM posts p
      ${where} AND link IS NOT NULL AND link != ''
      ${orderby}
      LIMIT ${limit} OFFSET ${skip}
    `;
    const [postsData] = await db.query(postsQuery, values);

    // بخش بهینه‌سازی شده برای دریافت دسته‌ها و تگ‌ها
    if (terms == 1 && postsData.length > 0) {
      // ۱. استخراج تمام شناسه‌های پست (Post IDs)
      const postIds = postsData.map((p) => p.ID);

      // ۲. دریافت تمام ترم‌های مرتبط (دسته و تگ) فقط با یک کوئری
      const termsQuery = `
        SELECT
          rel.object_id,
          t.name,
          t.slug,
          t.taxonomy
        FROM wp_term_relationships AS rel
        JOIN terms AS t ON rel.term_taxonomy_id = t.ID
        WHERE rel.object_id IN (?) AND t.taxonomy IN ('category', 'post_tag')
      `;
      const [allTerms] = await db.query(termsQuery, [postIds]);

      // ۳. گروه‌بندی ترم‌ها بر اساس شناسه پست برای دسترسی سریع
      const termsByPostId = allTerms.reduce((acc, term) => {
        const { object_id, taxonomy, name, slug } = term;
        // اگر برای این شناسه پستی هنوز آبجکتی ساخته نشده، آن را بساز
        if (!acc[object_id]) {
          acc[object_id] = { cat: [], tag: [] };
        }
        // تشخیص نوع ترم و افزودن به آرایه مربوطه
        const termType = taxonomy === "category" ? "cat" : "tag";
        acc[object_id][termType].push({ name, slug });
        return acc;
      }, {});

      // ۴. ضمیمه کردن آرایه‌های cat و tag به هر پست
      postsData.forEach((post) => {
        const postTerms = termsByPostId[post.ID] || { cat: [], tag: [] };
        post.cat = postTerms.cat;
        post.tag = postTerms.tag;
      });
    }

    return { post: postsData, total: total };
  } catch (e) {
    console.error("Database query error:", e);
    return { error: "خطایی در دریافت اطلاعات رخ داد." };
  }
}
