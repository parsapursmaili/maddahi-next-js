import { db } from "@/app/lib/db/mysql";

export default async function Page() {
  // نام رو به Page تغییر دادم و به صورت default export کردم
  const [rows] = await db.query(`select view from posts`);
  let totalViews = 0;

  for (const row of rows) {
    totalViews += parseInt(row.view);
  }

  return <h1>{totalViews}</h1>;
}
