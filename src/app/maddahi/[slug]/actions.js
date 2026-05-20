// app/posts/[id]/actions.js
"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { isAuthenticated } from "@/app/maddahi/actions/auth";
import { cookies, headers } from "next/headers";

const VISITED_COOKIE_NAME = "visited_pages_token";

// سیستم تشخیص ربات‌ها بر اساس هدرهای درخواست سروری
async function isBotRequest() {
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") || "";
  const botPatterns = [
    /bot/i,
    /spider/i,
    /crawl/i,
    /slurp/i,
    /yahoo/i,
    /mediapartners/i,
    /lighthouse/i,
    /chrome-lighthouse/i,
    /pingdom/i,
    /gtmetrix/i,
    /headless/i,
    /selenium/i,
    /puppeteer/i,
    /playwright/i,
    /curl/i,
    /wget/i,
  ];
  return botPatterns.some((pattern) => pattern.test(userAgent));
}

export async function incrementView(postId) {
  try {
    // ۱. اگر ربات باشد، فقط مقدار فعلی بازدید را بدون افزایش برمی‌گردانیم
    if (await isBotRequest()) {
      const [view] = await db.query(`SELECT view FROM posts WHERE ID = ?`, [
        postId,
      ]);
      return view[0]?.view || 0;
    }

    const isAdmin = await isAuthenticated();

    if (!isAdmin) {
      const cookieStore = await cookies();
      const cookieVal = cookieStore.get(VISITED_COOKIE_NAME)?.value || "";

      let visitedPages = [];
      try {
        visitedPages = JSON.parse(cookieVal);
        if (!Array.isArray(visitedPages)) visitedPages = [];
      } catch (e) {
        visitedPages = [];
      }

      const pageKey = `post_${postId}`;

      // ۲. اگر کاربر در ۲۴ ساعت گذشته از این پست بازدید نکرده باشد، بازدید جدید ثبت می‌شود
      if (!visitedPages.includes(pageKey)) {
        // ثبت در آمار روزانه و کل
        const dailyViewQuery = `
          INSERT INTO daily_post_views (post_id, view_date, view_count)
          VALUES (?, CURDATE(), 1)
          ON DUPLICATE KEY UPDATE view_count = view_count + 1
        `;
        await db.query(dailyViewQuery, [postId]);
        await db.query("UPDATE posts SET view = view + 1 WHERE ID = ?", [
          postId,
        ]);

        // ۳. افزودن شناسه به لیست کوکی و ذخیره آن با عمر ۱ روز (۲۴ ساعت)
        visitedPages.push(pageKey);
        cookieStore.set(VISITED_COOKIE_NAME, JSON.stringify(visitedPages), {
          maxAge: 24 * 60 * 60, // 24 hours
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }
    }

    const [view] = await db.query(`SELECT view FROM posts WHERE ID = ?`, [
      postId,
    ]);
    return view[0]?.view || 0;
  } catch (error) {
    console.error(`Error incrementing view for post ID ${postId}:`, error);
    return 0;
  }
}
