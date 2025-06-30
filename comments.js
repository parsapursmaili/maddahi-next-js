import { db } from "@/app/lib/db/mysql";
export async function POST() {
  const [comments] = await db.query(`select * from wp_comments`);

  const [finish] = await db.query(
    `replace into comments (ID, post_id, author_name, author_email, comment_content, user_ip, user_agent, created_at, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [
      comments.comment_ID,
      comments.co,
      authorName,
      authorEmail,
      commentContent,
      userIp,
      userAgent,
      0,
    ]
  );
}
