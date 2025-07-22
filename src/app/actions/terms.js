"use server";
import { db } from "@/app/lib/db/mysql";

export default async function getTerms(params) {
  let { req = 2 } = params;
  req = parseInt(req);
  let where = "where taxonomy = 'category' or taxonomy = 'post_tag'";
  if (req == 0) where = "WHERE taxonomy = 'category'";
  if (req == 1) where = "WHERE taxonomy = 'post_tag'";

  try {
    const [data] = await db.query(`
      select * from terms ${where} order by name asc`);
    return data;
  } catch (error) {
    console.error("MySQL Error:", error);
    return 0;
  }
}
