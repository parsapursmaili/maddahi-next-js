"use server";

import { db } from "@/app/lib/db/mysql";

export default async function getPosts(params) {
  const {
    page = 1,
    maddah = 0,
    monasebat = 0,
    rand = 0,
    s: search = null,
  } = params;

  let orderby = "";
  switch (rand) {
    case 0:
      orderby = "ORDER BY p.date DESC";
      break;
    case 1:
      orderby = "ORDER BY RAND()";
      break;
    case 2:
      orderby = "ORDER BY view DESC";
      break;
    default:
      orderby = "ORDER BY RAND()";
      break;
  }

  const limit = 20;
  let skip = 0;
  if (rand === 0 || rand === 2) {
    skip = (page - 1) * limit;
  }

  try {
    let where = `WHERE type = 'post' `;
    let values = [];

    if (search) {
      where += ` AND (title LIKE ? OR content LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }
    if (maddah) {
      where += ` AND ID IN (SELECT object_id FROM wp_term_relationships WHERE term_taxonomy_id = ?)`;
      values.push(maddah);
    }
    if (monasebat) {
      where += ` AND ID IN (SELECT object_id FROM wp_term_relationships WHERE term_taxonomy_id = ?)`;
      values.push(monasebat);
    }

    const countQuery = `SELECT COUNT(*) as total FROM posts ${where}`;
    const totalResult = await db.query(countQuery, values);
    const total = totalResult[0][0].total;

    // کوئری برای گرفتن خود پست‌ها
    const postsQuery = `
      SELECT p.title as post_title, p.link, p.thumbnail as thumb
      FROM posts p
      ${where} AND link IS NOT NULL AND link != ''
      ${orderby}
      LIMIT ${limit} OFFSET ${skip}
    `;
    const postsResult = await db.query(postsQuery, values);
    const posts = postsResult[0];

    return { total, posts };
  } catch (e) {
    console.error("Database query error:", e);
    // در یک برنامه واقعی، بهتر است یک خطای مشخص‌تر به کلاینت برگردانید
    return { error: "خطایی در دریافت اطلاعات رخ داد." };
  }
}
