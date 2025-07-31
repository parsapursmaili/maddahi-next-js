"use server";

// ========= شروع تغییر =========
// از unstable_cache استفاده می‌کنیم و نام آن را به cache تغییر می‌دهیم تا بقیه کد دست نخورده باقی بماند
import { unstable_cache as cache } from "next/cache";
// ========= پایان تغییر =========

import { db } from "@/app/maddahi/lib/db/mysql";

/**
 * این تابع ۷ مداح (category) برتر را بر اساس مجموع بازدید پست‌هایشان برمی‌گرداند.
 * نتایج این تابع به مدت ۳۰ روز کش می‌شود تا از اجرای مکرر کوئری سنگین جلوگیری شود.
 */
export const getTopMaddahs = cache(
  async () => {
    try {
      const [topMaddahsResult] = await db.query(
        `
        SELECT 
          t.name, 
          t.slug, 
          tm.image_url,
          SUM(CAST(p.view AS UNSIGNED)) as total_views
        FROM terms AS t
        JOIN wp_term_relationships AS tr ON t.ID = tr.term_taxonomy_id
        JOIN posts AS p ON tr.object_id = p.ID
        LEFT JOIN terms_metadata AS tm ON t.ID = tm.term_id
        WHERE 
          t.taxonomy = 'category' AND p.view IS NOT NULL
        GROUP BY 
          t.ID, t.name, t.slug, tm.image_url
        ORDER BY 
          total_views DESC
        LIMIT 7
        `
      );

      if (!topMaddahsResult || topMaddahsResult.length === 0) {
        return [];
      }

      return topMaddahsResult.map((maddah) => ({
        name: maddah.name,
        slug: maddah.slug,
        imageUrl: maddah.image_url ? `/uploads/${maddah.image_url}` : null,
      }));
    } catch (error) {
      console.error("Failed to fetch top maddahs:", error);
      return [];
    }
  },
  ["top_maddahs_list"],
  {
    revalidate: 2592000,
    tags: ["maddahs", "top-performers"],
  }
);
