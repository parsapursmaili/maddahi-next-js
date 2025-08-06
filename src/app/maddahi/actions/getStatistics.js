"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { toShamsi } from "@/app/maddahi/lib/utils/formatDate";

/**
 * آمار کلی داشبورد را واکشی می‌کند.
 */
export async function getDashboardStatistics() {
  try {
    // تغییر ۱: حذف کوئری تعداد برگه‌ها
    const [[{ postsCount }]] = await db.query(
      "SELECT COUNT(ID) as postsCount FROM posts WHERE type = 'post'"
    );
    const [[{ totalCommentsCount }]] = await db.query(
      "SELECT COUNT(id) as totalCommentsCount FROM comments"
    );
    const [[{ pendingCommentsCount }]] = await db.query(
      "SELECT COUNT(id) as pendingCommentsCount FROM comments WHERE status = 0"
    );
    // تغییر ۲: محاسبه بازدید کل از جدول posts و فیلد view
    const [[{ totalViews }]] = await db.query(
      "SELECT SUM(CAST(view AS UNSIGNED)) as totalViews FROM posts WHERE type = 'post'"
    );

    // تغییر ۳: اضافه شدن کوئری برای محاسبه بازدید امروز
    const [[{ todaysViews }]] = await db.query(
      "SELECT SUM(view_count) as todaysViews FROM daily_post_views WHERE view_date = CURDATE()"
    );

    // تغییر ۴: محاسبه پربازدیدترین‌ها بر اساس ۳۰ روز گذشته به جای ماه میلادی جاری
    const [topPostsLast30Days] = await db.query(`
      SELECT p.ID, p.title, p.link, SUM(dv.view_count) as monthly_views
      FROM posts p
      JOIN daily_post_views dv ON p.ID = dv.post_id
      WHERE dv.view_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY p.ID, p.title, p.link
      ORDER BY monthly_views DESC
      LIMIT 7;
    `);

    // سایر کوئری‌ها بدون تغییر باقی می‌مانند
    const [contentGrowth] = await db.query(`
      SELECT DATE_FORMAT(date, '%Y-%m') as month, COUNT(ID) as count
      FROM posts WHERE type = 'post' AND date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month ORDER BY month ASC;
    `);

    const formattedContentGrowth = contentGrowth.map((item) => ({
      ...item,
      month: toShamsi(item.month + "-01", "jMMMM jYYYY"),
    }));

    const [allTimeTopPosts] = await db.query(`
      SELECT ID, title, link, CAST(view AS UNSIGNED) as total_views
      FROM posts WHERE type = 'post' ORDER BY total_views DESC LIMIT 10;
    `);

    const [topCategories] = await db.query(`
      SELECT
        t.name,
        COUNT(p.ID) as post_count
      FROM terms AS t
      JOIN wp_term_relationships AS rel ON t.ID = rel.term_taxonomy_id
      JOIN posts AS p ON rel.object_id = p.ID
      WHERE
        t.taxonomy = 'category' AND p.type = 'post'
      GROUP BY t.name
      ORDER BY post_count DESC
      LIMIT 5;
    `);

    return {
      success: true,
      data: {
        quickStats: {
          postsCount,
          totalCommentsCount,
          pendingCommentsCount,
          totalViews: totalViews || 0,
          todaysViews: todaysViews || 0, // برگرداندن بازدید امروز
        },
        topPostsLast30Days, // تغییر نام برای وضوح بیشتر
        contentGrowth: formattedContentGrowth,
        allTimeTopPosts,
        topCategories,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return {
      success: false,
      message: "خطا در دریافت اطلاعات آماری.",
      data: null,
    };
  }
}

/**
 * پست‌های برتر را با فیلتر زمانی و صفحه‌بندی برای اسکرول بی‌نهایت واکشی می‌کند.
 * @param {object} params
 * @param {'day'|'week'|'month'|'year'|'all'} params.range - بازه زمانی
 * @param {number} params.page - شماره صفحه برای صفحه‌بندی
 */
export async function getPaginatedTopPosts({ range = "all", page = 1 }) {
  const limit = 20; // تعداد آیتم در هر صفحه
  const offset = (page - 1) * limit;

  try {
    let query;
    let params = [limit, offset];

    switch (range) {
      case "day":
        query = `
          SELECT p.ID, p.title, p.link, SUM(dv.view_count) as views
          FROM posts p
          JOIN daily_post_views dv ON p.ID = dv.post_id
          WHERE dv.view_date = CURDATE()
          GROUP BY p.ID, p.title, p.link
          ORDER BY views DESC
          LIMIT ? OFFSET ?;
        `;
        break;
      case "week":
        query = `
          SELECT p.ID, p.title, p.link, SUM(dv.view_count) as views
          FROM posts p
          JOIN daily_post_views dv ON p.ID = dv.post_id
          WHERE dv.view_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY p.ID, p.title, p.link
          ORDER BY views DESC
          LIMIT ? OFFSET ?;
        `;
        break;
      case "month":
        query = `
          SELECT p.ID, p.title, p.link, SUM(dv.view_count) as views
          FROM posts p
          JOIN daily_post_views dv ON p.ID = dv.post_id
          WHERE dv.view_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          GROUP BY p.ID, p.title, p.link
          ORDER BY views DESC
          LIMIT ? OFFSET ?;
        `;
        break;
      case "year":
        query = `
          SELECT p.ID, p.title, p.link, SUM(dv.view_count) as views
          FROM posts p
          JOIN daily_post_views dv ON p.ID = dv.post_id
          WHERE dv.view_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
          GROUP BY p.ID, p.title, p.link
          ORDER BY views DESC
          LIMIT ? OFFSET ?;
        `;
        break;
      case "all":
      default:
        query = `
          SELECT ID, title, link, CAST(view AS UNSIGNED) as views
          FROM posts WHERE type = 'post'
          ORDER BY views DESC
          LIMIT ? OFFSET ?;
        `;
        break;
    }

    const [posts] = await db.query(query, params);
    return {
      success: true,
      data: posts,
      // اگر تعداد آیتم‌های بازگشتی کمتر از حد تعیین شده باشد، یعنی صفحه دیگری وجود ندارد
      hasMore: posts.length === limit,
    };
  } catch (error) {
    console.error(
      `Error fetching paginated top posts for range ${range}:`,
      error
    );
    return {
      success: false,
      message: "خطا در دریافت لیست پست‌ها.",
      data: [],
      hasMore: false,
    };
  }
}
export async function getPostMonthlyStats(postId) {
  if (!postId) return { success: false, message: "شناسه پست نامعتبر است." };
  try {
    const [[postDetails]] = await db.query(
      "SELECT title FROM posts WHERE ID = ?",
      [postId]
    );

    if (!postDetails)
      return { success: false, message: "پست مورد نظر یافت نشد." };

    const [dailyViews] = await db.query(
      `
      SELECT DATE_FORMAT(view_date, '%Y-%m-%d') as date, view_count
      FROM daily_post_views
      WHERE post_id = ? AND view_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY view_date ASC;
      `,
      [postId]
    );

    // ۳. تبدیل تاریخ با استفاده از تابع اصلاح‌شده ما
    const formattedDailyViews = dailyViews.map((view) => ({
      ...view,
      // حالا این تابع به درستی "۲ مرداد" را برمی‌گرداند
      date: toShamsi(view.date, "jD jMMMM"),
    }));

    return {
      success: true,
      data: { title: postDetails.title, views: formattedDailyViews },
    };
  } catch (error) {
    console.error(`Error fetching stats for post ${postId}:`, error);
    return { success: false, message: "خطا در دریافت آمار پست." };
  }
}
