"use server";

import { db } from "@/app/lib/db/mysql";
// ۱. وارد کردن ابزار اصلاح‌شده و سرور-فرندلی
import { toShamsi } from "@/app/lib/utils/formatDate";

/**
 * آمار کلی داشبورد را واکشی می‌کند.
 */
export async function getDashboardStatistics() {
  try {
    // ======== این بخش‌ها دقیقاً مانند نسخه کاربردی شما هستند ========
    const [[{ postsCount }]] = await db.query(
      "SELECT COUNT(ID) as postsCount FROM posts WHERE type = 'post'"
    );
    const [[{ pagesCount }]] = await db.query(
      "SELECT COUNT(ID) as pagesCount FROM posts WHERE type = 'page'"
    );
    const [[{ totalCommentsCount }]] = await db.query(
      "SELECT COUNT(id) as totalCommentsCount FROM comments"
    );
    const [[{ pendingCommentsCount }]] = await db.query(
      "SELECT COUNT(id) as pendingCommentsCount FROM comments WHERE status = 0"
    );
    const [[{ totalViews }]] = await db.query(
      "SELECT SUM(view_count) as totalViews FROM daily_post_views"
    );

    const [topPostsThisMonth] = await db.query(`
      SELECT p.ID, p.title, p.link, SUM(dv.view_count) as monthly_views
      FROM posts p
      JOIN daily_post_views dv ON p.ID = dv.post_id
      WHERE dv.view_date >= DATE_FORMAT(NOW(), '%Y-%m-01') AND dv.view_date <= LAST_DAY(NOW())
      GROUP BY p.ID, p.title, p.link
      ORDER BY monthly_views DESC
      LIMIT 7;
    `);

    const [contentGrowth] = await db.query(`
      SELECT DATE_FORMAT(date, '%Y-%m') as month, COUNT(ID) as count
      FROM posts WHERE type = 'post' AND date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month ORDER BY month ASC;
    `);

    // ۲. تبدیل تاریخ با استفاده از تابع اصلاح‌شده ما
    const formattedContentGrowth = contentGrowth.map((item) => ({
      ...item,
      // حالا این تابع به درستی "مرداد ۱۴۰۴" را برمی‌گرداند
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
          pagesCount,
          totalCommentsCount,
          pendingCommentsCount,
          totalViews: totalViews || 0,
        },
        topPostsThisMonth,
        contentGrowth: formattedContentGrowth,
        allTimeTopPosts,
        topCategories,
        contentTypes: { posts: postsCount, pages: pagesCount },
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    // بخش catch بدون تغییر باقی می‌ماند
    return {
      success: false,
      message: "خطا در دریافت اطلاعات آماری.",
      data: null,
    };
  }
}

/**
 * آمار ماهانه یک پست خاص را واکشی می‌کند.
 */
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
