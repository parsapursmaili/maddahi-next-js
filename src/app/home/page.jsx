import Slider from "../componenet/slider";
import { db } from "@/app/lib/db/mysql";

export const revalidate = 3600;

async function fetchPosts(orderby = "date desc") {
  try {
    const [data] = await db.query(
      `select title,thumbnail as thumb from posts where type='post' and status='publish' order by ${orderby}  limit 20`
    );

    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}
export default async function Home() {
  const slides = await fetchPosts();
  const slides2 = await fetchPosts("view desc");

  return (
    <div className="container mx-auto p-4 w-[1350px]">
      <h3 className="text-2xl text-white font-bold mb-4">آخرین نماهنگ ها</h3>
      <Slider slides={slides} />
      <h3 className="text-2xl text-white font-bold mb-4 mt-5">
        محبوب ترین نماهنگ ها
      </h3>
      <Slider slides={slides2} />
    </div>
  );
}
