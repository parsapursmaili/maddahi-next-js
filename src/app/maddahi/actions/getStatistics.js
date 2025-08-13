"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { toShamsi } from "@/app/maddahi/lib/utils/formatDate";

/**
 * آمار سریع و کلی را برای نمایش در داشبورد اصلی پنل مدیریت واکشی می‌کند.
 * شامل تعداد پست‌ها، دیدگاه‌ها، بازدید کل و بازدید امروز.
 * @returns {Promise<object>} آبجکتی شامل وضعیت موفقیت و داده‌های آماری.
 */
export async function getDashboardStatistics() {
  try {
    // اجرای همزمان کوئری‌ها برای بهبود پرفورمنس
    const [
      [[{ postsCount }]],
      [[{ totalCommentsCount }]],
      [[{ pendingCommentsCount }]],
      [[{ totalViews }]],
      [[{ todaysViews }]],
      [topPostsToday],
      [topPostsLast30Days],
      [contentGrowth],
      [allTimeTopPosts],
      [topCategories],
    ] = await Promise.all([
      db.query("SELECT COUNT(ID) as postsCount FROM posts WHERE type = 'post'"),
      db.query("SELECT COUNT(id) as totalCommentsCount FROM comments"),
      db.query(
        "SELECT COUNT(id) as pendingCommentsCount FROM comments WHERE status = 0"
      ),
      db.query("SELECT SUM(view) as totalViews FROM posts WHERE type = 'post'"),
      db.query(
        "SELECT SUM(view_count) as todaysViews FROM daily_post_views WHERE view_date = CURDATE()"
      ),
      db.query(`
        SELECT p.ID, p.title, p.link, dv.view_count as daily_views
        FROM posts p JOIN daily_post_views dv ON p.ID = dv.post_id
        WHERE dv.view_date = CURDATE() ORDER BY daily_views DESC LIMIT 7;
      `),
      db.query(`
        SELECT p.ID, p.title, p.link, SUM(dv.view_count) as monthly_views
        FROM posts p JOIN daily_post_views dv ON p.ID = dv.post_id
        WHERE dv.view_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY p.ID, p.title, p.link ORDER BY monthly_views DESC LIMIT 7;
      `),
      db.query(`
        SELECT DATE_FORMAT(date, '%Y-%m') as month, COUNT(ID) as count
        FROM posts WHERE type = 'post' AND date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month ORDER BY month ASC;
      `),
      db.query(
        "SELECT ID, title, link, view as total_views FROM posts WHERE type = 'post' ORDER BY total_views DESC LIMIT 10;"
      ),
      db.query(`
        SELECT t.name, COUNT(p.ID) as post_count
        FROM terms AS t
        JOIN wp_term_relationships AS rel ON t.ID = rel.term_taxonomy_id
        JOIN posts AS p ON rel.object_id = p.ID
        WHERE t.taxonomy = 'category' AND p.type = 'post'
        GROUP BY t.name ORDER BY post_count DESC LIMIT 5;
      `),
    ]);

    // فرمت کردن تاریخ‌ها برای نمودار رشد محتوا
    const formattedContentGrowth = contentGrowth.map((item) => ({
      ...item,
      month: toShamsi(item.month + "-01", "jMMMM jYYYY"),
    }));

    return {
      success: true,
      data: {
        quickStats: {
          postsCount,
          totalCommentsCount,
          pendingCommentsCount,
          totalViews: totalViews || 0,
          todaysViews: todaysViews || 0,
        },
        topPostsToday,
        topPostsLast30Days,
        contentGrowth: formattedContentGrowth,
        allTimeTopPosts,
        topCategories,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return {
      success: false,
      message: "خطا در دریافت اطلاعات آماری داشبورد.",
      data: null,
    };
  }
}

/**
 * لیست پست‌های پربازدید را بر اساس بازه زمانی مشخص شده، به صورت صفحه‌بندی شده واکشی می‌کند.
 * @returns {Promise<object>} آبجکتی شامل وضعیت موفقیت، لیست پست‌ها، و بازه زمانی دقیق.
 */
export async function getPaginatedTopPosts({
  range = "all",
  page = 1,
  startDate,
  endDate,
}) {
  const limit = 50;
  const offset = (page - 1) * limit;

  try {
    let postsQuery, totalViewsQuery;
    let queryParams = [];
    let postsParams = [];

    // متغیرهایی برای نگهداری تاریخ شروع و پایان واقعی
    let queryStartDate = startDate;
    let queryEndDate = endDate;
    const today = new Date().toISOString().split("T")[0];

    if (range === "all") {
      postsQuery = `SELECT ID, title, link, view as views FROM posts WHERE type = 'post' ORDER BY views DESC LIMIT ? OFFSET ?;`;
      postsParams = [limit, offset];
      totalViewsQuery = `SELECT SUM(view) as totalViews FROM posts WHERE type = 'post'`;
      queryStartDate = null;
      queryEndDate = null;
    } else {
      let whereClause = "";
      switch (range) {
        case "day":
          whereClause = `WHERE dv.view_date = CURDATE()`;
          queryStartDate = today;
          queryEndDate = today;
          break;
        case "yesterday":
          whereClause = `WHERE dv.view_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          queryStartDate = yesterday.toISOString().split("T")[0];
          queryEndDate = queryStartDate;
          break;
        case "week":
          whereClause = `WHERE dv.view_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 6); // از ۷ روز پیش تا امروز
          queryStartDate = lastWeek.toISOString().split("T")[0];
          queryEndDate = today;
          break;
        case "month":
          whereClause = `WHERE dv.view_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
          const lastMonth = new Date();
          lastMonth.setDate(lastMonth.getDate() - 29); // از ۳۰ روز پیش تا امروز
          queryStartDate = lastMonth.toISOString().split("T")[0];
          queryEndDate = today;
          break;
        case "year":
          whereClause = `WHERE dv.view_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`;
          const lastYear = new Date();
          lastYear.setFullYear(lastYear.getFullYear() - 1);
          lastYear.setDate(lastYear.getDate() + 1); // از یک سال پیش تا امروز
          queryStartDate = lastYear.toISOString().split("T")[0];
          queryEndDate = today;
          break;
        case "custom":
          if (startDate && endDate) {
            whereClause = `WHERE dv.view_date BETWEEN ? AND ?`;
            queryParams.push(startDate, endDate);
          }
          break;
      }

      postsQuery = `
        SELECT p.ID, p.title, p.link, SUM(dv.view_count) as views
        FROM posts p JOIN daily_post_views dv ON p.ID = dv.post_id
        ${whereClause} GROUP BY p.ID, p.title, p.link
        ORDER BY SUM(dv.view_count) DESC LIMIT ? OFFSET ?;
      `;
      postsParams = [...queryParams, limit, offset];
      totalViewsQuery = `SELECT SUM(view_count) as totalViews FROM daily_post_views dv ${whereClause};`;
    }

    const [[totalViewsResult]] = await db.query(totalViewsQuery, queryParams);
    const [posts] = await db.query(postsQuery, postsParams);
    const totalViews = totalViewsResult ? totalViewsResult.totalViews : 0;

    return {
      success: true,
      data: {
        posts,
        totalViews: totalViews || 0,
        startDate: queryStartDate,
        endDate: queryEndDate,
      },
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
      data: { posts: [], totalViews: 0 },
      hasMore: false,
    };
  }
}

/**
 * اولین تاریخ ثبت شده در آمار روزانه را برای نمایش "شروع ثبت آمار" پیدا می‌کند.
 * @returns {Promise<object>} آبجکتی شامل وضعیت موفقیت و اولین تاریخ.
 */
export async function getFirstRecordDate() {
  try {
    const [[firstDateRecord]] = await db.query(
      "SELECT MIN(view_date) as first_date FROM daily_post_views"
    );
    return {
      success: true,
      data: firstDateRecord.first_date,
    };
  } catch (error) {
    console.error("Error fetching first record date:", error);
    return {
      success: false,
      message: "خطا در دریافت تاریخ شروع آمار.",
      data: null,
    };
  }
}

/**
 * آمار بازدید روزانه یک پست خاص را در ۳۰ روز اخیر واکشی می‌کند.
 * @param {number|string} postId - شناسه پست مورد نظر.
 * @returns {Promise<object>} آبجکتی شامل وضعیت موفقیت و آمار بازدید پست.
 */
export async function getPostMonthlyStats(postId) {
  if (!postId) {
    return { success: false, message: "شناسه پست نامعتبر است." };
  }
  try {
    const [[postDetails]] = await db.query(
      "SELECT title FROM posts WHERE ID = ?",
      [postId]
    );
    if (!postDetails) {
      return { success: false, message: "پست مورد نظر یافت نشد." };
    }
    const [dailyViews] = await db.query(
      `
      SELECT DATE_FORMAT(view_date, '%Y-%m-%d') as date, view_count
      FROM daily_post_views
      WHERE post_id = ? AND view_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY view_date ASC;
      `,
      [postId]
    );

    const formattedDailyViews = dailyViews.map((view) => ({
      ...view,
      date: toShamsi(view.date, "jD jMMMM"),
    }));

    return {
      success: true,
      data: {
        title: postDetails.title,
        views: formattedDailyViews,
      },
    };
  } catch (error) {
    console.error(`Error fetching stats for post ${postId}:`, error);
    return { success: false, message: "خطا در دریافت آمار پست." };
  }
}
