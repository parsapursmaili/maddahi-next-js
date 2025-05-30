import Slider from "../componenet/slider";
import { db } from "@/app/lib/db/mysql";

export const revalidate = 5;

async function fetchPosts(ID = "0") {
  try {
    const response = await fetch(
      `${process.env.SITE_URL}/api/posts/?rand=${ID}`,
      {
        next: {
          cache: "no-store",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      if (data.error) throw new Error(data.error);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return data.posts2;
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}
export default async function Home() {
  const slides = await fetchPosts();
  const slides2 = await fetchPosts(2);

  return (
    <div className="container mx-auto p-4 w-[1350px]">
      <h1 className="text-2xl text-white font-bold mb-4">آخرین نماهنگ ها</h1>
      <Slider slides={slides} />
      <h1 className="text-2xl text-white font-bold mb-4 mt-5">
        محبوب ترین نماهنگ ها
      </h1>
      <Slider slides={slides2} />
    </div>
  );
}
