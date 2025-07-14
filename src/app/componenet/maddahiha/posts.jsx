"use client";
import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

const Posts = ({ posts, setHnadle, isPlay, setIndex, setPID, PID }) => {
  const handlePlayPause = (post, i) => {
    if (PID === post.ID) {
      setHnadle(post.link);
    } else {
      setIndex(i);
      setPID(post.ID);
      setHnadle(post.link);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-40">
      {posts.map((post, i) => {
        const maddahName = post.cat?.[0]?.name;
        const isCurrentlyPlaying = PID === post.ID;

        return (
          <div
            key={post.ID}
            className="bg-[var(--background-secondary)] rounded-2xl shadow-xl overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-[var(--accent-primary)/20] hover:-translate-y-1"
          >
            <div className="relative flex items-center p-4">
              {/* Thumbnail */}
              <Link
                href={`/${post.ID}`}
                className="block flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden"
              >
                {post.thumb ? (
                  <Image
                    src={`https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumb}`}
                    alt={post.post_title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--background-tertiary)] flex items-center justify-center rounded-lg">
                    <svg
                      className="w-8 h-8 text-[var(--foreground-muted)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m5-5l-1-1"
                      />
                    </svg>
                  </div>
                )}
              </Link>

              {/* Text Content */}
              <Link href={`/${post.ID}`} className="flex-grow mr-4">
                <h3 className="text-base font-bold text-[var(--foreground-primary)] mb-1 transition-colors group-hover:text-[var(--accent-primary)] leading-tight">
                  {post.post_title}
                </h3>
                {maddahName && (
                  <p className="text-xs text-[var(--foreground-secondary)] font-medium">
                    {maddahName}
                  </p>
                )}
              </Link>

              {/* Play/Pause Button */}
              <button
                onClick={() => handlePlayPause(post, i)}
                aria-label={isCurrentlyPlaying ? "توقف" : "پخش"}
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md transition-all duration-300
                  ${
                    isCurrentlyPlaying && isPlay
                      ? "bg-[var(--accent-primary)] text-[var(--background-primary)] scale-110"
                      : "bg-[var(--background-tertiary)] text-[var(--foreground-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--background-primary)]"
                  }
                  focus:outline-none focus:ring-4 focus:ring-[var(--accent-primary)/50]`}
              >
                {isCurrentlyPlaying && isPlay ? (
                  <PauseIcon className="w-6 h-6 cursor-pointer" />
                ) : (
                  <PlayIcon className="w-6 h-6 pl-0.5 cursor-pointer" />
                )}
              </button>
            </div>

            {/* Tags (Optional - displays below main content if present) */}
            {post.tag && post.tag.length > 0 && (
              <div className="px-4 pb-4 border-t border-[var(--border-secondary)] pt-3">
                <div className="flex flex-wrap gap-2">
                  {post.tag.slice(0, 2).map((tagItem) => (
                    <span
                      key={tagItem.slug}
                      className="block text-xs font-semibold bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] px-2.5 py-1 rounded-full"
                    >
                      {tagItem.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default memo(Posts);
