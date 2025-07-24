// /app/actions/getPostById.js
"use server";

import { db } from "@/app/lib/db/mysql";

export default async function getPostById(postId) {
  if (!postId) {
    return null;
  }

  try {
    // واکشی اطلاعات اصلی پست
    const [postRows] = await db.query("SELECT * FROM posts WHERE ID = ?", [
      postId,
    ]);
    if (postRows.length === 0) {
      return null;
    }
    const post = postRows[0];

    // واکشی تمام روابط ترم برای این پست
    const [relationships] = await db.query(
      `
      SELECT
        t.ID,
        t.taxonomy
      FROM wp_term_relationships AS rel
      JOIN terms AS t ON rel.term_taxonomy_id = t.ID
      WHERE rel.object_id = ? AND t.taxonomy IN ('category', 'post_tag')
    `,
      [postId]
    );

    // جداسازی ID ها در آرایه‌های دسته‌بندی و تگ
    post.categories = relationships
      .filter((r) => r.taxonomy === "category")
      .map((r) => r.ID);
    post.tags = relationships
      .filter((r) => r.taxonomy === "post_tag")
      .map((r) => r.ID);

    return post;
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    return null;
  }
}
