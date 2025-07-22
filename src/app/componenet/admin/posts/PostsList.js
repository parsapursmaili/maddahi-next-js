// /app/components/admin/PostsList.js
"use client";

import { Search, PlusCircle, ArrowDownUp } from "lucide-react";

/**
 * کامپوننتی برای نمایش، جستجو و مرتب‌سازی لیست پست‌ها
 * @param {object} props
 * @param {Array} props.posts - لیست پست‌ها برای نمایش
 * @param {number|null} props.selectedPostId - شناسه پست انتخاب شده برای هایلایت کردن
 * @param {boolean} props.isLoading - وضعیت در حال بارگذاری بودن لیست
 * @param {string} props.searchQuery - مقدار فعلی فیلد جستجو
 * @param {function(string):void} props.onSearchChange - تابع برای تغییر مقدار جستجو
 * @param {string} props.sortBy - مقدار فعلی فیلد مرتب‌سازی
 * @param {function(string):void} props.onSortChange - تابع برای تغییر مقدار مرتب‌سازی
 * @param {function(object):void} props.onSelectPost - تابع برای انتخاب یک پست
 * @param {function():void} props.onNewPost - تابع برای ایجاد یک پست جدید
 */
export default function PostsList({
  posts,
  selectedPostId,
  isLoading,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onSelectPost,
  onNewPost,
}) {
  const inputClasses =
    "w-full bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--foreground-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]";

  return (
    <div className="w-full md:w-1/3 border-r border-[var(--border-primary)] flex flex-col h-full">
      {/* هدر */}
      <div className="p-4 border-b border-[var(--border-primary)]">
        <h2 className="text-xl font-bold mb-4">مدیریت پست‌ها</h2>
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
            size={18}
          />
          <input
            type="text"
            placeholder="جستجوی پست..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${inputClasses} pl-10 pr-4 py-2`}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-grow relative">
            <ArrowDownUp
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
              size={16}
            />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className={`${inputClasses} appearance-none pl-10 pr-4 py-2 text-sm`}
            >
              <option value="0">جدیدترین</option>
              <option value="2">پربازدیدترین</option>
              <option value="1">تصادفی</option>
            </select>
          </div>
          <button
            onClick={onNewPost}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-black rounded-md hover:bg-[var(--accent-crystal-highlight)] transition-colors text-sm font-semibold"
          >
            <PlusCircle size={16} />
            <span>پست جدید</span>
          </button>
        </div>
      </div>

      {/* لیست */}
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-center text-[var(--foreground-muted)]">
            در حال بارگذاری...
          </p>
        ) : (
          <ul>
            {posts.map((post) => (
              <li
                key={post.ID}
                onClick={() => onSelectPost(post)}
                className={`p-4 border-b border-[var(--border-secondary)] cursor-pointer transition-colors ${
                  selectedPostId === post.ID
                    ? "bg-[var(--accent-primary-faded)]"
                    : "hover:bg-[var(--background-tertiary)]"
                }`}
              >
                <h3 className="font-semibold text-md">{post.title}</h3>
                <p className="text-xs text-[var(--foreground-muted)]">
                  ID: {post.ID} - بازدید: {post.view}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
