import { db } from "../../lib/db/mysql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let req = searchParams.get("s") || "hame";
  req = req.toString();
  let where = "";
  if (req == "maddah") where = "WHERE t.taxonomy = 'category'";
  if (req == "monasebat") where = "WHERE t.taxonomy = 'post_tag'";
  try {
    const [data] = await db.query(`
      SELECT pt.term_id, pt.name
      FROM wp_term_taxonomy t
      LEFT JOIN wp_terms pt ON pt.term_id = t.term_id
      ${where}`);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("MySQL Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch categories" }),
      {
        status: 500,
      }
    );
  }
}
