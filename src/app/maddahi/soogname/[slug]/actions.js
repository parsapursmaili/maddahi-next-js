"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { notFound } from "next/navigation";
import { unstable_cache as cache } from "next/cache";
import { isAuthenticated } from "@/app/maddahi/actions/auth"; // ایمپورت تابع احراز هویت
/**
 * یک تابع کمکی برای تبدیل لیست تخت کامنت‌ها به ساختار درختی.
 * این تابع کامنت‌های پاسخ را به عنوان فرزندان کامنت والد قرار می‌دهد.
 * @param {Array} comments - آرایه‌ای از کامنت‌ها که از دیتابیس واکشی شده.
 * @returns {Array} - آرایه‌ای از کامنت‌های ریشه که هرکدام می‌توانند شامل فرزندان باشند.
 */
const buildCommentTree = (comments) => {
  const commentMap = {};
  const nestedComments = [];

  // ابتدا همه کامنت‌ها را در یک نقشه قرار می‌دهیم تا دسترسی سریع داشته باشیم.
  comments.forEach((comment) => {
    commentMap[comment.id] = { ...comment, children: [] };
  });

  // سپس هر کامنت را بررسی کرده و در جای درست (زیر والد یا در سطح ریشه) قرار می‌دهیم.
  comments.forEach((comment) => {
    if (comment.parent_id && commentMap[comment.parent_id]) {
      commentMap[comment.parent_id].children.push(commentMap[comment.id]);
    } else {
      nestedComments.push(commentMap[comment.id]);
    }
  });

  return nestedComments;
};

export const getSoognamePageData = cache(
  async (slug) => {
    if (!slug) notFound();
    const decode = decodeURIComponent(slug);
    const [soognameRows] = await db.query(
      "SELECT * FROM soogname WHERE url = ? AND status = 'published' LIMIT 1",
      [decode]
    );

    if (!soognameRows || soognameRows.length === 0) {
      notFound();
    }
    const soogname = soognameRows[0];

    const [termsRows, playlistRows, commentsRows] = await Promise.all([
      db.query(
        `SELECT t.ID, t.name, t.slug, t.taxonomy 
         FROM soogname_terms st
         JOIN terms t ON st.term_id = t.ID
         WHERE st.soogname_id = ?`,
        [soogname.id]
      ),
      db.query(
        `SELECT p.ID, p.title, p.link 
         FROM soogname_posts sp
         JOIN posts p ON sp.post_id = p.ID
         WHERE sp.soogname_id = ? AND p.status = 'publish' AND p.link IS NOT NULL
         ORDER BY sp.display_order ASC`,
        [soogname.id]
      ),
      // کوئری برای واکشی کامنت‌های تایید شده با post_type صحیح
      db.query(
        `SELECT id, parent_id, name, text, created_at 
         FROM comments 
         WHERE post_id = ? AND post_type = 'soogname' AND status = 1 
         ORDER BY created_at ASC`, // مرتب‌سازی بر اساس قدیمی‌ترین برای نمایش صحیح ترتیب
        [soogname.id]
      ),
    ]);

    const allTerms = termsRows[0] || [];
    const maddah = allTerms.filter((t) => t.taxonomy === "category");
    const tags = allTerms.filter((t) => t.taxonomy === "post_tag");
    const playlist = playlistRows[0] || [];

    // پردازش و آماده‌سازی کامنت‌ها
    const rawComments = commentsRows[0] || [];
    const comments = buildCommentTree(rawComments);
    const totalCommentsCount = rawComments.length;

    // ارسال کامنت‌های پردازش شده و تعداد کل آن‌ها به صفحه
    return {
      soogname,
      maddah,
      tags,
      playlist,
      comments,
      totalCommentsCount,
    };
  },
  ["getSoognamePageData"],
  {
    tags: ["soogname"],
  }
);

export async function incrementSoognameView(soognameId) {
  try {
    // اگر کاربر لاگین کرده باشد (ادمین)، بازدید شمارش نمی‌شود
    if (!(await isAuthenticated())) {
      // ثبت یا افزایش بازدید روزانه
      const dailyViewQuery = `
        INSERT INTO daily_soogname_views (soogname_id, view_date, view_count)
        VALUES (?, CURDATE(), 1)
        ON DUPLICATE KEY UPDATE view_count = view_count + 1
      `;
      await db.query(dailyViewQuery, [soognameId]);

      await db.query("UPDATE soogname SET view = view + 1 WHERE id = ?", [
        soognameId,
      ]);
    }

    // واکشی و بازگرداندن تعداد بازدید کل
    const [view] = await db.query(`SELECT view FROM soogname WHERE id = ?`, [
      soognameId,
    ]);
    return view[0].view;
  } catch (error) {
    console.error(
      `Error incrementing view for soogname ID ${soognameId}:`,
      error
    );
    return 0; // در صورت خطا، صفر برمی‌گردانیم
  }
}
