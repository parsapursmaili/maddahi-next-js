"use client";
import { memo } from "react";
import Image from "next/image";

const Posts = ({ posts, setIndex, index, setHnadle }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-40">
      {posts.map((post, i) => (
        <div
          key={i}
          // جایگزینی کلاس .items با کلاس‌های Tailwind
          className="flex items-center p-4 bg-slate-800 rounded-xl shadow-lg hover:shadow-emerald-500/10 hover:bg-slate-700 transition-all duration-300 cursor-pointer"
          onClick={() => {
            setIndex(i);
            setHnadle(post.link);
          }}
        >
          {post.thumb && (
            <div className="flex-shrink-0">
              <Image
                width={60}
                height={60}
                alt={post.post_title}
                className="rounded-full"
                src={`https://besooyeto.ir/maddahi/wp-content/uploads/${
                  post.thumb.split(".")[0]
                }-150x150.${post.thumb.split(".")[1]}`}
              />
            </div>
          )}
          <h2
            className={`flex-grow mr-4 text-sm lg:text-base font-semibold text-slate-200 transition-colors ${
              index === i ? "bounce" : "" // استفاده از انیمیشن bounce
            }`}
          >
            {post.post_title}
          </h2>
        </div>
      ))}
    </div>
  );
};
export default memo(Posts);
