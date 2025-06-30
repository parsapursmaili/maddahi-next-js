import { db } from "@/app/lib/db/mysql";
import { notFound } from "next/navigation";
import MusicPlayer from "../componenet/singleplayer";
import Slider from "@/app/componenet/slider";
import Image from "next/image";
import Comment from "@/app/componenet/comments";
export async function generateMetadata({ params }) {
  const id = params.id;
  const [rows] = await db.query("SELECT * FROM posts WHERE ID = ?", [id]);

  if (!rows || rows.length === 0) {
    return {
      title: "صفحه یافت نشد",
      description: "محتوایی برای این شناسه یافت نشد.",
    };
  }

  const post = rows[0];

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 150),
    keywords: post.tags
      ? post.tags.split(",").join(",")
      : post.title.split(" ").join(","),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 150),
      images: post.thumbnail
        ? `https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}`
        : "/default-og-image.jpg",
      url: `https://besooyeto.ir/posts/${post.id}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.content.substring(0, 150),
      images: post.thumbnail
        ? `https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}`
        : "/default-twitter-image.jpg",
    },
  };
}

//export const revalidate = 360000;

export default async function ProductPage({ params }) {
  const id = params.id;
  const [rows] = await db.query("SELECT * FROM posts WHERE ID = ?", [id]);
  const [maddah] = await db.query(
    `select t.name,t.slug from wp_term_relationships wtr inner join terms t on t.ID=wtr.term_taxonomy_id and t.taxonomy='category' where object_id= ? `,
    [id]
  );
  const [monasebat] = await db.query(
    `select t.name,t.slug from wp_term_relationships wtr inner join terms t on t.ID=wtr.term_taxonomy_id and t.taxonomy='post_tag' where object_id= ? `,
    [id]
  );
  if (!rows || rows.length === 0) {
    notFound();
  }

  const post = rows[0];

  return (
    <div className="min-h-screen bg-black text-gray-100 py-8 px-4 md:px-8 lg:px-12 flex justify-center items-start">
      <article className="w-full max-w-3xl bg-gray-900 shadow-2xl rounded-xl border border-gray-700 ">
        <div className="flex w-full mt-10 mb-10 mr-5 ml-5">
          <div className="flex-1">
            {post.thumbnail && (
              <Image
                src={`https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}`}
                alt={post.title}
                width={250}
                height={250}
                className="flex-shrink-0 transition-transform duration-300 hover:scale-105 rounded-xl" /* flex-shrink-0 و rounded اضافه شد */
                priority
              />
            )}
          </div>
          <div className="mr-5 flex-2 flex-col flex items-start">
            {" "}
            <h1 className="mb-[-10px]">{post.title}</h1>
            <br />
            {maddah.map((maddahh, i) => (
              <a
                className="mb-2"
                href={`http://localhost:3000/${maddahh.slug}`}
                key={i}
              >
                {maddahh.name}
              </a>
            ))}
            <p></p>
            {monasebat.map((maddahh, i) => (
              <a
                className="mb-2"
                href={`http://localhost:3000/${maddahh.slug}`}
                key={i}
              >
                {maddahh.name}
              </a>
            ))}
            <h3>بازدید: {post.view}</h3>
          </div>
        </div>
        <MusicPlayer audioSrc={post.link} />
        <div
          className="prose prose-lg prose-invert max-w-none text-gray-200 leading-relaxed break-words p-4 md:p-6" /* padding اضافه شد */
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <Comment />
      </article>
    </div>
  );
}
