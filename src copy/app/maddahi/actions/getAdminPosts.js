// /app/maddahi/actions/getAdminPosts.js
"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { isAuthenticated } from "@/app/maddahi/actions/auth";

const POSTS_PER_PAGE = 30; // تعداد پست‌ها در هر صفحه برای اسکرول بی‌نهایت

export default async function getAdminPosts(params) {
  // بررسی احراز هویت در ابتدای اکشن برای امنیت
  if (!(await isAuthenticated())) {
    return { error: "دسترسی غیر مجاز", posts: [], hasMore: false };
  }

  let {
    page = 1,
    s: searchQuery = null,
    sortBy = "0", // 0: جدیدترین, 2: پربازدیدترین, 1: تصادفی
  } = params;

  const pageNum = parseInt(page) || 1;
  const sortByNum = parseInt(sortBy);
  const offset = (pageNum - 1) * POSTS_PER_PAGE;

  // تعیین ترتیب مرتب‌سازی بر اساس پارامتر 'sortBy'
  let orderby = "";
  switch (sortByNum) {
    case 0:
      orderby = "ORDER BY p.date DESC"; // جدیدترین
      break;
    case 1:
      orderby = "ORDER BY RAND()"; // تصادفی
      break;
    case 2:
      orderby = "ORDER BY CAST(p.view AS UNSIGNED) DESC"; // پربازدیدترین
      break;
    default:
      orderby = "ORDER BY p.date DESC"; // پیش‌فرض: جدیدترین
      break;
  }

  try {
    // شرایط اصلی کوئری برای پنل ادمین
    // - نمایش پست‌ها و صفحات (post & page)
    // - حذف فیلتر بر اساس status و link تا همه موارد (حتی پیش‌نویس) نمایش داده شوند
    let whereClauses = [`p.type IN ('post', 'page')`];
    let queryValues = [];
    let orderByValues = []; // مقادیر جداگانه برای بخش ORDER BY

    // افزودن شرط جستجو اگر وجود داشته باشد
    if (searchQuery) {
      whereClauses.push(`(p.title LIKE ? OR p.content LIKE ?)`);
      queryValues.push(`%${searchQuery}%`, `%${searchQuery}%`);

      const secondaryOrder = orderby.replace("ORDER BY ", "");
      // بازنویسی ORDER BY برای اولویت‌بندی نتایج جستجو
      orderby = `
        ORDER BY
          CASE
            WHEN p.title LIKE ? THEN 1
            WHEN p.content LIKE ? THEN 2
            ELSE 3
          END,
          ${secondaryOrder}
      `;
      orderByValues.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    const where = `WHERE ${whereClauses.join(" AND ")}`;
    const finalQueryValues = [...queryValues, ...orderByValues];

    // کوئری اصلی برای واکشی پست‌ها
    const postsQuery = `
      SELECT
        p.ID,
        p.title,
        p.view,
        p.status
      FROM posts p
      ${where}
      ${orderby}
      LIMIT ${POSTS_PER_PAGE} OFFSET ${offset}
    `;

    // کوئری برای شمارش کل نتایج مطابق با فیلترها (بدون LIMIT و OFFSET)
    const totalCountQuery = `SELECT COUNT(p.ID) as total FROM posts p ${where}`;

    // اجرای همزمان هر دو کوئری
    const [postsResult, totalCountResult] = await Promise.all([
      db.query(postsQuery, finalQueryValues),
      db.query(totalCountQuery, queryValues), // کوئری شمارش فقط به مقادیر where نیاز دارد
    ]);

    const posts = postsResult[0];
    const totalPosts = totalCountResult[0][0].total;

    // محاسبه اینکه آیا صفحات بیشتری برای بارگذاری وجود دارد یا خیر
    const hasMore = offset + posts.length < totalPosts;

    return { posts, hasMore };
  } catch (e) {
    console.error("Database query error in getAdminPosts:", e);
    return {
      error: "خطایی در دریافت اطلاعات رخ داد.",
      posts: [],
      hasMore: false,
    };
  }
}
