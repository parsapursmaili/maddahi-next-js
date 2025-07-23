// app/actions/post.js
"use server";

import { db } from "@/app/lib/db/mysql";

/**
 * دریافت اطلاعات یک پست بر اساس اسلاگ (نام)
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function getPostBySlug(slug) {
  const [rows] = await db.query("SELECT * FROM posts WHERE name = ?", [slug]);
  return rows[0] || null;
}

/**
 * دریافت دسته‌بندی‌های (مداح) یک پست
 * @param {number} postId
 * @returns {Promise<Array>}
 */
async function getPostCategories(postId) {
  const [rows] = await db.query(
    `SELECT t.ID, t.name, t.slug FROM wp_term_relationships wtr INNER JOIN terms t ON t.ID = wtr.term_taxonomy_id AND t.taxonomy = 'category' WHERE object_id = ?`,
    [postId]
  );
  return rows || [];
}

/**
 * دریافت تگ‌های (مناسبت) یک پست
 * @param {number} postId
 * @returns {Promise<Array>}
 */
async function getPostTags(postId) {
  const [rows] = await db.query(
    `SELECT t.ID, t.name, t.slug FROM wp_term_relationships wtr INNER JOIN terms t ON t.ID = wtr.term_taxonomy_id AND t.taxonomy = 'post_tag' WHERE object_id = ?`,
    [postId]
  );
  return rows || [];
}

/**
 * ★★★ دریافت نظرات یک پست (اصلاح شده) ★★★
 * @param {number} postId
 * @returns {Promise<Array>}
 */
async function getPostComments(postId) {
  // فرض بر این است که جدول نظرات شما `wp_comments` است.
  // 1. انتخاب ستون‌های مورد نیاز با نام مستعار (alias) برای تطابق با فرانت‌اند.
  // 2. فیلتر کردن نظرات برای نمایش فقط موارد تایید شده (`comment_approved = '1'`).
  const [rows] = await db.query(
    `SELECT 
       comment_ID as id, 
       comment_author AS author_name, 
       comment_content, 
       comment_date AS created_at 
     FROM wp_comments 
     WHERE comment_post_ID = ? AND comment_approved = '1' 
     ORDER BY comment_date DESC`,
    [postId]
  );
  return rows || [];
}

/**
 * دریافت پست‌های مشابه بر اساس تگ
 * @param {Array<number>} tagIds
 * @param {number} currentPostId
 * @returns {Promise<Array>}
 */
async function getSimilarPosts(tagIds, currentPostId) {
  if (tagIds.length === 0) return [];
  const [rows] = await db.query(
    `
    SELECT DISTINCT p.* FROM posts AS p
    JOIN wp_term_relationships AS wtr ON p.ID = wtr.object_id
    WHERE wtr.term_taxonomy_id IN (?) AND p.ID != ?
    ORDER BY RAND() LIMIT 20;
  `,
    [tagIds, currentPostId]
  );
  return rows || [];
}

/**
 * تابع اصلی برای دریافت تمام داده‌های مورد نیاز صفحه
 * @param {string} slug
 * @returns {Promise<object>}
 */
export async function getPageData(slug) {
  const post = await getPostBySlug(slug);

  if (!post) {
    return { notFound: true };
  }

  const [maddah, monasebat, comments] = await Promise.all([
    getPostCategories(post.ID),
    getPostTags(post.ID),
    getPostComments(post.ID),
  ]);

  const monasebatIds = monasebat.map((tag) => tag.ID);
  const moshabeh = await getSimilarPosts(monasebatIds, post.ID);

  return {
    post,
    maddah,
    monasebat,
    comments,
    moshabeh,
    notFound: false,
  };
}
