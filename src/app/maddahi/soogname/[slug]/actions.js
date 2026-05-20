// app/maddahi/soogname/[slug]/actions.js

"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { notFound } from "next/navigation";
import { unstable_cache as cache } from "next/cache";
import { isAuthenticated } from "@/app/maddahi/actions/auth";

const buildCommentTree = (comments) => {
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
      db.query(
        `SELECT id, parent_id, name, text, created_at 
         FROM comments 
         WHERE post_id = ? AND post_type = 'soogname' AND status = 1 
         ORDER BY created_at ASC`,
        [soogname.id]
      ),
    ]);

    const allTerms = termsRows[0] || [];
    const maddah = allTerms.filter((t) => t.taxonomy === "category");
    const tags = allTerms.filter((t) => t.taxonomy === "post_tag");
    const playlist = playlistRows[0] || [];
    const rawComments = commentsRows[0] || [];
    const comments = buildCommentTree(rawComments);
    const totalCommentsCount = rawComments.length;

    // ★★★ شروع تغییرات: واکشی اطلاعات برای اسلایدرها ★★★
    const playlistPostIds = playlist.map((p) => p.ID);
    if (playlistPostIds.length === 0) {
      // اگر پلی‌لیست خالی بود، یک مقدار غیرممکن قرار می‌دهیم تا کوئری خطا ندهد
      playlistPostIds.push(0);
    }

    let similarFromOccasion = [];
    if (tags.length > 0) {
      const tagIds = tags.map((t) => t.ID);
      const [similarRows] = await db.query(
        `
          SELECT DISTINCT p.ID, p.title, p.name, p.thumbnail, p.thumbnail_alt FROM posts AS p
          JOIN wp_term_relationships AS wtr ON p.ID = wtr.object_id
          WHERE wtr.term_taxonomy_id IN (?) AND p.ID NOT IN (?) and p.status = 'publish'
          ORDER BY RAND() LIMIT 6;
        `,
        [tagIds, playlistPostIds]
      );
      similarFromOccasion = similarRows;
    }

    let latestFromMaddah = [];
    if (maddah.length > 0) {
      const maddahIds = maddah.map((m) => m.ID);
      const [latestRows] = await db.query(
        `
          SELECT DISTINCT p.ID, p.title, p.name, p.thumbnail, p.thumbnail_alt
          FROM posts AS p
          JOIN wp_term_relationships AS wtr ON p.ID = wtr.object_id
          WHERE wtr.term_taxonomy_id IN (?) AND p.ID NOT IN (?) and p.status = 'publish'
          ORDER BY p.date DESC
          LIMIT 6;
        `,
        [maddahIds, playlistPostIds]
      );
      latestFromMaddah = latestRows;
    }
    // ★★★ پایان تغییرات ★★★

    return {
      soogname,
      maddah,
      tags,
      playlist,
      comments,
      totalCommentsCount,
      // ★★★ افزودن دیتای جدید به خروجی تابع ★★★
      similarFromOccasion,
      latestFromMaddah,
    };
  },
  ["getSoognamePageData"],
  {
    tags: ["soogname"],
  }
);

export async function incrementSoognameView(soognameId) {
  try {
    if (!(await isAuthenticated())) {
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
    const [view] = await db.query(`SELECT view FROM soogname WHERE id = ?`, [
      soognameId,
    ]);
    return view[0].view;
  } catch (error) {
    console.error(
      `Error incrementing view for soogname ID ${soognameId}:`,
      error
    );
    return 0;
  }
}
