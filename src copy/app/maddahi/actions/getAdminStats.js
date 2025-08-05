// /app/actions/getAdminStats.js
"use server";
import { db } from "@/app/maddahi/lib/db/mysql"; // فرض بر اینکه getDb را در این مسیر قرار داده‌ای

export async function getAdminStats() {
  try {
    // 1. دریافت تعداد کل پست‌ها (post_type = 'post')
    const [postsResult] = await db.query(
      "SELECT COUNT(ID) as count FROM posts WHERE type = 'post'"
    );
    const postsCount = postsResult[0].count || 0;

    // 2. دریافت تعداد کل برگه‌ها (post_type = 'page')
    const [pagesResult] = await db.query(
      "SELECT COUNT(ID) as count FROM posts WHERE type = 'page'"
    );
    const pagesCount = pagesResult[0].count || 0;

    // 3. دریافت تعداد کل دیدگاه‌ها
    const [totalCommentsResult] = await db.query(
      "SELECT COUNT(id) as count FROM comments"
    );
    const totalCommentsCount = totalCommentsResult[0].count || 0;

    // 4. دریافت تعداد دیدگاه‌های در انتظار تایید (status = 0)
    const [pendingCommentsResult] = await db.query(
      "SELECT COUNT(id) as count FROM comments WHERE status = 0"
    );
    const pendingCommentsCount = pendingCommentsResult[0].count || 0;

    // 5. دریافت تعداد کل دسته‌بندی‌ها و برچسب‌ها
    const [termsResult] = await db.query(
      "SELECT COUNT(ID) as count FROM terms"
    );
    const termsCount = termsResult[0].count || 0;

    return {
      success: true,
      data: {
        postsCount,
        pagesCount,
        totalCommentsCount,
        pendingCommentsCount,
        termsCount,
      },
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      success: false,
      message: "خطا در برقراری ارتباط با دیتابیس رخ داد.",
    };
  }
}
