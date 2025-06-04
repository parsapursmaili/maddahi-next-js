import { db } from "@/app/lib/db/mysql";
import { notFound } from "next/navigation";
import Image from "next/image";

//export const revalidate = 3600;

export default async function ProductPage({ params }) {
  const id = params.id;

  const [rows] = await db.query("SELECT * FROM posts WHERE ID = ?", [id]);

  if (!rows || rows.length === 0) {
    notFound();
  }

  const post = rows[0];

  return (
    <>
      <h1 className="text-3xl mt-10 mr-5 ">{post.title}</h1>
      {console.log(
        `https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}}`
      )}
      <Image
        height={300}
        width={300}
        className={`rounded-2xl inline`}
        src={
          post.thumbnail
            ? `https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}}`
            : ""
        }
      />
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      
    </>
  );
}
