// app/lib/actions.js

"use server";

import { db } from "@/app/lib/db/mysql";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

// تابع nestComments بدون تغییر باقی می‌ماند...
const nestComments = (comments) => {
  const commentMap = {};
  const nestedComments = [];
  comments.forEach((comment) => {
    commentMap[comment.id] = { ...comment, children: [] };
  });
  comments.forEach((comment) => {
    if (comment.parent_id && commentMap[comment.parent_id]) {
      commentMap[comment.parent_id].children.push(commentMap[comment.id]);
    } else {
      nestedComments.push(commentMap[comment.id]);
    }
  });
  return nestedComments;
};

export async function getPostPageData(slug) {
  noStore();

  // ۱. دریافت اطلاعات اصلی پست
  const [postRows] = await db.query(
    "SELECT * FROM posts WHERE name = ? AND status = 'publish' LIMIT 1",
    [slug]
  );
  if (!postRows || postRows.length === 0) {
    notFound();
  }
  const post = postRows[0];

  // ۲. اجرای همزمان کوئری‌های باقی‌مانده برای بهینگی
  const [maddahRows, monasebatRows, commentsRows] = await Promise.all([
    db.query(
      `SELECT t.ID, t.name, t.slug FROM wp_term_relationships wtr INNER JOIN terms t ON t.ID = wtr.term_taxonomy_id AND t.taxonomy = 'category' WHERE object_id = ?`,
      [post.ID]
    ),
    db.query(
      `SELECT t.ID, t.name, t.slug FROM wp_term_relationships wtr INNER JOIN terms t ON t.ID = wtr.term_taxonomy_id AND t.taxonomy = 'post_tag' WHERE object_id = ?`,
      [post.ID]
    ),
    db.query(
      `SELECT id, parent_id, name, text, created_at FROM comments WHERE post_id = ? AND status = 1 ORDER BY created_at DESC`,
      [post.ID]
    ),
  ]);

  const maddah = maddahRows[0] || [];
  const monasebat = monasebatRows[0] || [];
  const rawComments = commentsRows[0] || [];

  // ۳. دریافت پست‌های مشابه بر اساس مناسبت (رندوم)
  let moshabeh = [];
  const monasebatIds = monasebat.map((tag) => tag.ID);
  if (monasebatIds.length > 0) {
    const [moshabehRows] = await db.query(
      `
      SELECT DISTINCT p.ID, p.title, p.name, p.thumbnail, p.thumbnail_alt FROM posts AS p
      JOIN wp_term_relationships AS wtr ON p.ID = wtr.object_id
      WHERE wtr.term_taxonomy_id IN (?) AND p.ID != ?
      ORDER BY RAND() LIMIT 20;
    `,
      [monasebatIds, post.ID]
    );
    moshabeh = moshabehRows;
  }

  // --- شروع تغییرات ---
  // ۴. دریافت آخرین پست‌ها از همین مداح (دسته‌بندی)
  let latestFromMaddah = [];
  const maddahIds = maddah.map((cat) => cat.ID);
  if (maddahIds.length > 0) {
    const [latestRows] = await db.query(
      `
      SELECT DISTINCT p.ID, p.title, p.name, p.thumbnail, p.thumbnail_alt
      FROM posts AS p
      JOIN wp_term_relationships AS wtr ON p.ID = wtr.object_id
      WHERE wtr.term_taxonomy_id IN (?) AND p.ID != ?
      ORDER BY p.date DESC
      LIMIT 20;
    `,
      [maddahIds, post.ID]
    );
    latestFromMaddah = latestRows;
  }
  // --- پایان تغییرات ---

  // ۵. ساختار درختی نظرات
  const nestedComments = nestComments(rawComments);

  // ۶. بازگرداندن تمام داده‌ها در یک آبجکت
  return {
    post,
    maddah,
    monasebat,
    moshabeh,
    latestFromMaddah, // ارسال داده‌های جدید به کامپوننت
    comments: nestedComments,
    totalCommentsCount: rawComments.length,
  };
}
