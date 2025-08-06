// app/posts/[id]/actions.js
"use server"; // 👈 این خط رو حتماً بذارید

import { db } from "@/app/maddahi/lib/db/mysql"; // مسیر صحیح دیتابیس
import { isAuthenticated } from "@/app/maddahi/actions/auth";

export async function incrementView(postId) {
  try {
    if (!(await isAuthenticated())) {
      const dailyViewQuery = `
      INSERT INTO daily_post_views (post_id, view_date, view_count)
      VALUES (?, CURDATE(), 1)
      ON DUPLICATE KEY UPDATE view_count = view_count + 1
    `;
      await db.query(dailyViewQuery, [postId]);

      await db.query("UPDATE posts SET view = view + 1 WHERE ID = ?", [postId]);
    }
    const [view] = await db.query(`select view from posts where ID= ?`, [
      postId,
    ]);
    return view[0].view;
  } catch (error) {
    console.error(`Error incrementing view for post ID ${postId}:`, error);
    return 0;
  }
}
