"use server";

import { db } from "@/app/lib/db/mysql";

export default async function getPosts(params) {
  const {
    page = 1,
    maddah = 0,
    monasebat = 0,
    rand = 0,
    s: search = null,
    terms = 0, // این پارامتر کنترل می‌کند که آیا ترم‌ها (دسته‌بندی‌ها و برچسب‌ها) واکشی شوند یا خیر.
    view = 0, // این پارامتر کنترل می‌کند که آیا مجموع بازدیدها (totalview) محاسبه شود یا خیر.
  } = params;

  // تعیین ترتیب مرتب‌سازی بر اساس پارامتر 'rand'
  let orderby = "";
  switch (rand) {
    case 0:
      orderby = "ORDER BY p.date DESC"; // بر اساس تاریخ نزولی (جدیدترین)
      break;
    case 1:
      orderby = "ORDER BY RAND()"; // مرتب‌سازی تصادفی
      break;
    case 2:
      orderby = "ORDER BY CAST(p.view AS UNSIGNED) DESC"; // بر اساس تعداد بازدید نزولی
      break;
    default:
      orderby = "ORDER BY RAND()"; // پیش‌فرض: تصادفی
      break;
  }

  const limit = 20;
  let skip = 0;
  if (rand === 0 || rand === 2) {
    skip = (page - 1) * limit;
  }

  try {
    let whereClauses = [
      `p.type = 'post'`,
      `p.link IS NOT NULL`,
      `p.link != ''`,
    ];
    let values = [];
    // --- شروع تغییرات ---
    // آرایه‌ای جداگانه برای مقادیر پارامترهای بخش ORDER BY
    let orderByValues = [];

    // افزودن شرط جستجو اگر پارامتر 'search' وجود داشته باشد
    if (search) {
      whereClauses.push(`(p.title LIKE ? OR p.content LIKE ?)`);
      values.push(`%${search}%`, `%${search}%`);

      // استخراج مرتب‌سازی ثانویه از مرتب‌سازی اصلی
      const secondaryOrder = orderby.replace("ORDER BY ", "");

      // بازنویسی کامل دستور ORDER BY برای اولویت‌بندی نتایج جستجو
      orderby = `
        ORDER BY
          CASE
            WHEN p.title LIKE ? THEN 1 -- اولویت اول: نتایجی که در عنوان هستند
            WHEN p.content LIKE ? THEN 2 -- اولویت دوم: نتایجی که در محتوا هستند
            ELSE 3 -- سایر موارد
          END,
          ${secondaryOrder} -- مرتب‌سازی ثانویه (تاریخ، بازدید و غیره)
      `;
      // افزودن مقادیر پارامترهای جستجو برای بخش ORDER BY
      orderByValues.push(`%${search}%`, `%${search}%`);
    }
    // --- پایان تغییرات ---

    // افزودن شرط فیلتر بر اساس 'maddah' (شناسه ترم)
    if (maddah) {
      whereClauses.push(
        `p.ID IN (SELECT object_id FROM wp_term_relationships WHERE term_taxonomy_id = ?)`
      );
      values.push(maddah);
    }

    // افزودن شرط فیلتر بر اساس 'monasebat' (شناسه ترم)
    if (monasebat) {
      whereClauses.push(
        `p.ID IN (SELECT object_id FROM wp_term_relationships WHERE term_taxonomy_id = ?)`
      );
      values.push(monasebat);
    }

    const where = `WHERE ${whereClauses.join(" AND ")}`;

    // ترکیب مقادیر WHERE و ORDER BY برای کوئری اصلی
    // ترتیب قرارگیری پارامترها باید با ترتیب علامت‌های '?' در کوئری نهایی مطابقت داشته باشد
    const finalQueryValues = [...values, ...orderByValues];

    const queriesToExecute = [
      // کوئری برای دریافت تعداد کل پست‌ها (total) - بدون نیاز به ORDER BY
      db.query(`SELECT COUNT(p.ID) as total FROM posts p ${where}`, values),
      // کوئری برای دریافت داده‌های پست‌ها با مرتب‌سازی جدید
      db.query(
        `
        SELECT
          p.ID,
          p.title,
          p.name,
          p.link,
          p.thumbnail,
          p.view
        FROM posts p
        ${where}
        ${orderby}
        LIMIT ${limit} OFFSET ${skip}
      `,
        finalQueryValues // ارسال مقادیر ترکیبی به کوئری اصلی
      ),
    ];

    if (view === 1) {
      // کوئری مجموع بازدیدها نیز نیازی به ORDER BY ندارد
      queriesToExecute.push(
        db.query(
          `SELECT SUM(CAST(p.view AS UNSIGNED)) as total_views_sum FROM posts p ${where}`,
          values
        )
      );
    }

    const results = await Promise.all(queriesToExecute);

    const totalResult = results[0][0];
    const postsData = results[1][0];

    const total = totalResult[0].total;
    let totalview = 0;
    if (view === 1) {
      const totalViewResult = results[2][0];
      totalview = totalViewResult[0].total_views_sum || 0;
    }

    if (terms === 1 && postsData.length > 0) {
      const postIds = postsData.map((p) => p.ID);
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
      const termsByPostId = allTerms.reduce((acc, term) => {
        const { object_id, taxonomy, name, slug } = term;
        if (!acc[object_id]) {
          acc[object_id] = { cat: [], tag: [] };
        }
        const termType = taxonomy === "category" ? "cat" : "tag";
        acc[object_id][termType].push({ name, slug });
        return acc;
      }, {});
      postsData.forEach((post) => {
        const postTerms = termsByPostId[post.ID] || { cat: [], tag: [] };
        post.cat = postTerms.cat;
        post.tag = postTerms.tag;
      });
    }

    return { post: postsData, total: total, totalview: totalview };
  } catch (e) {
    console.error("Database query error:", e);
    return { error: "خطایی در دریافت اطلاعات رخ داد." };
  }
}
