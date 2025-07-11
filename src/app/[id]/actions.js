// app/posts/[id]/actions.js
"use server"; // 👈 این خط رو حتماً بذارید

import { db } from "@/app/lib/db/mysql"; // مسیر صحیح دیتابیس

export async function incrementView(postId) {
  try {
    await db.query("UPDATE posts SET view = view + 1 WHERE ID = ?", [postId]);
    const [view] = await db.query(`select view from posts where ID= ?`, [
      postId,
    ]);
    return view[0].view;
  } catch (error) {
    console.error(`Error incrementing view for post ID ${postId}:`, error);
    return 0;
  }
}
