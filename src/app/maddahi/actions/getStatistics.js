"use server";

import { db } from "@/app/maddahi/lib/db/mysql";

export async function getDashboardStatistics() {
  try {
    const [
      [[{ postsCount }]],
      [[{ totalCommentsCount }]],
      [[{ pendingCommentsCount }]],
      [[{ totalViews }]],
      [[{ todaysViews }]],
      [topPostsToday],
      [topPostsLast30Days],
      [contentGrowth], // This is the problematic query
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
      db.query(
        `SELECT p.name,p.ID, p.title, p.link, dv.view_count as daily_views FROM posts p JOIN daily_post_views dv ON p.ID = dv.post_id WHERE dv.view_date = CURDATE() ORDER BY daily_views DESC LIMIT 7;`
      ),
      db.query(
        `SELECT p.name,p.ID, p.title, p.link, SUM(dv.view_count) as monthly_views FROM posts p JOIN daily_post_views dv ON p.ID = dv.post_id WHERE dv.view_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY p.ID, p.title, p.link ORDER BY monthly_views DESC LIMIT 7;`
      ),
      // CORRECTED QUERY: Using 'date' column from 'posts' table
      // این کوئری تاریخ را به صورت YYYY-MM-DD برمی‌گرداند
      db.query(
        `SELECT DATE(date) AS month, COUNT(ID) AS count FROM posts WHERE type = 'post' AND date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY DATE(date) ORDER BY date ASC;`
      ),
      db.query(
        "SELECT name,ID, title, link, view as total_views FROM posts WHERE type = 'post' ORDER BY total_views DESC LIMIT 10;"
      ),
      db.query(
        `SELECT t.name, COUNT(p.ID) as post_count FROM terms AS t JOIN wp_term_relationships AS rel ON t.ID = rel.term_taxonomy_id JOIN posts AS p ON rel.object_id = p.ID WHERE t.taxonomy = 'category' AND p.type = 'post' GROUP BY t.name ORDER BY post_count DESC LIMIT 5;`
      ),
    ]);

    // نکته: contentGrowth شامل ردیف‌هایی است که فیلد month به شکل 'YYYY-MM-DD' است.
    // بازگرداندن منطق تبدیل و گروه‌بندی به تقویم شمسی ماهانه به اینجا
    const persianGrowthData = new Map();

    contentGrowth.forEach((item) => {
      const date = new Date(item.month); // item.month در اینجا YYYY-MM-DD است
      const year = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
        calendar: "persian",
        year: "numeric",
      }).format(date);
      const month = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
        calendar: "persian",
        month: "long",
      }).format(date);
      const key = `${year} ${month}`; // مثال: "۱۴۰۲ فروردین"
      persianGrowthData.set(
        key,
        (persianGrowthData.get(key) || 0) + item.count
      );
    });

    // مرتب سازی داده ها بر اساس تاریخ شمسی
    const sortedFormattedContentGrowth = Array.from(persianGrowthData)
      .sort((a, b) => {
        // برای مرتب سازی دقیق، بهتر است تاریخ‌های ISO اصلی را حفظ کرده و بر اساس آنها مرتب کنیم
        // اما اگر فقط فرمت شمسی ماه و سال را داریم، باید به روشی دیگر مرتب کنیم.
        // برای سادگی، فعلا بر اساس String مرتب می کنیم (که ممکن است همیشه درست نباشد اگر سال ها متفاوت باشند)
        // راه حل بهتر این است که یک فیلد date_sortable (ISO) به شی اضافه شود و بر اساس آن مرتب شود.
        // اما با توجه به فرمت فعلی "YYYY ماه" (شمسی)، بهتر است آن را به شیوه ای که در ادامه می آید مرتب کنیم.

        // مثال: "۱۴۰۲ فروردین"
        const parsePersianDate = (dateString) => {
          const parts = dateString.split(" "); // ["۱۴۰۲", "فروردین"]
          const year = parseInt(parts[0].replace(/[^0-9]/g, "")); // ۱۴۰۲ -> 1402
          const monthName = parts[1];
          const persianMonths = [
            "فروردین",
            "اردیبهشت",
            "خرداد",
            "تیر",
            "مرداد",
            "شهریور",
            "مهر",
            "آبان",
            "آذر",
            "دی",
            "بهمن",
            "اسفند",
          ];
          const monthIndex = persianMonths.indexOf(monthName);
          return { year, monthIndex };
        };

        const dateA = parsePersianDate(a[0]);
        const dateB = parsePersianDate(b[0]);

        if (dateA.year !== dateB.year) {
          return dateA.year - dateB.year;
        }
        return dateA.monthIndex - dateB.monthIndex;
      })
      .map(([month, count]) => ({
        month, // رشته ماه شمسی (مثال: "۱۴۰۲ فروردین")
        count,
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
        contentGrowth: sortedFormattedContentGrowth, // استفاده از داده‌های فرمت و مرتب شده
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
    let queryStartDate = startDate;
    let queryEndDate = endDate;
    const today = new Date().toISOString().split("T")[0];

    if (range === "all") {
      postsQuery = `SELECT name,ID, title, link, view as views FROM posts WHERE type = 'post' ORDER BY views DESC LIMIT ? OFFSET ?;`;
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
          lastWeek.setDate(lastWeek.getDate() - 6);
          queryStartDate = lastWeek.toISOString().split("T")[0];
          queryEndDate = today;
          break;
        case "month":
          whereClause = `WHERE dv.view_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
          const lastMonth = new Date();
          lastMonth.setDate(lastMonth.getDate() - 29);
          queryStartDate = lastMonth.toISOString().split("T")[0];
          queryEndDate = today;
          break;
        case "year":
          whereClause = `WHERE dv.view_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`;
          const lastYear = new Date();
          lastYear.setFullYear(lastYear.getFullYear() - 1);
          lastYear.setDate(lastYear.getDate() + 1);
          queryStartDate = lastYear.toISOString().split("T")[0];
          queryEndDate = today;
          break;
        case "custom":
          if (startDate && endDate) {
            whereClause = `WHERE dv.view_date BETWEEN ? AND ?`;
            queryParams.push(startDate, endDate);
            queryStartDate = startDate;
            queryEndDate = endDate;
          }
          break;
      }

      postsQuery = `SELECT p.ID, p.title, p.link, SUM(dv.view_count) as views FROM posts p JOIN daily_post_views dv ON p.ID = dv.post_id ${whereClause} GROUP BY p.ID, p.title, p.link ORDER BY SUM(dv.view_count) DESC LIMIT ? OFFSET ?;`;
      postsParams = [...queryParams, limit, offset];
      totalViewsQuery = `SELECT SUM(view_count) as totalViews FROM daily_post_views dv ${whereClause};`;
    }

    const [[totalViewsResult]] = await db.query(totalViewsQuery, queryParams);
    const [posts] = await db.query(postsQuery, postsParams);
    const totalViews = totalViewsResult ? totalViewsResult.totalViews : 0;

    // RETURN ISO dates (YYYY-MM-DD) — کلاینت مسئول تبدیل به شمس/فارسی خواهد بود.
    return {
      success: true,
      data: {
        posts,
        totalViews: totalViews || 0,
        startDate: queryStartDate || null, // ISO string or null
        endDate: queryEndDate || null, // ISO string or null
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

export async function getFirstRecordDate() {
  try {
    const [[firstDateRecord]] = await db.query(
      "SELECT MIN(view_date) as first_date FROM daily_post_views"
    );

    // برگرداندن ISO date (YYYY-MM-DD) یا null
    const firstDateIso = firstDateRecord.first_date
      ? new Date(firstDateRecord.first_date).toISOString().split("T")[0]
      : null;

    return {
      success: true,
      data: firstDateIso,
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
 * گرفتن آمار پست بر اساس بازه زمانی
 * @param {number|string} postId
 * @param {"daily"|"monthly"|"quarterly"|"yearly"} range
 */
export async function getPostStats(postId, range = "daily") {
  if (!postId) {
    return {
      success: false,
      message: "شناسه پست نامعتبر است.",
    };
  }

  try {
    const [[postDetails]] = await db.query(
      "SELECT title FROM posts WHERE ID = ?",
      [postId]
    );

    if (!postDetails) {
      return {
        success: false,
        message: "پست مورد نظر یافت نشد.",
      };
    }

    let query = "";
    let params = [postId];

    if (range === "daily") {
      query = `
        SELECT DATE_FORMAT(view_date, '%Y-%m-%d') as date, view_count 
        FROM daily_post_views 
        WHERE post_id = ? 
          AND view_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
        ORDER BY view_date ASC;
      `;
    } else if (range === "monthly") {
      query = `
        SELECT DATE_FORMAT(view_date, '%Y-%m') as date, SUM(view_count) as view_count 
        FROM daily_post_views 
        WHERE post_id = ? 
          AND view_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) 
        GROUP BY YEAR(view_date), MONTH(view_date)
        ORDER BY date ASC;
      `;
    } else if (range === "quarterly") {
      query = `
        SELECT CONCAT(YEAR(view_date), '-Q', QUARTER(view_date)) as date, SUM(view_count) as view_count 
        FROM daily_post_views 
        WHERE post_id = ? 
          AND view_date >= DATE_SUB(NOW(), INTERVAL 4 QUARTER) 
        GROUP BY YEAR(view_date), QUARTER(view_date)
        ORDER BY date ASC;
      `;
    } else if (range === "yearly") {
      query = `
        SELECT YEAR(view_date) as date, SUM(view_count) as view_count 
        FROM daily_post_views 
        WHERE post_id = ? 
          AND view_date >= DATE_SUB(NOW(), INTERVAL 5 YEAR) 
        GROUP BY YEAR(view_date)
        ORDER BY date ASC;
      `;
    }

    const [views] = await db.query(query, params);

    const formattedViews = views.map((view) => ({
      ...view,
      date: view.date,
    }));

    return {
      success: true,
      data: {
        title: postDetails.title,
        views: formattedViews,
      },
    };
  } catch (error) {
    console.error(`Error fetching stats for post ${postId}:`, error);
    return {
      success: false,
      message: "خطا در دریافت آمار پست.",
    };
  }
}
