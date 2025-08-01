// /app/maddahi/components/admin/PostsManager.js
"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Newspaper } from "lucide-react";

import PostForm from "./PostForm";
import PostsList from "./PostsList";
import getAdminPosts from "@/app/maddahi/actions/getAdminPosts"; // استفاده از اکشن سرور جدید
import getPostById from "@/app/maddahi/actions/getPostById";

export default function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("0");

  // --- تغییرات برای اسکرول بی‌نهایت ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [listIsLoading, startTransition] = useTransition();

  const [isFormLoading, setIsFormLoading] = useState(false);

  // تابع واکشی پست‌ها که اکنون صفحه را به عنوان ورودی می‌گیرد
  const fetchPosts = useCallback(
    (currentPage, isSearchOrSortChange = false) => {
      // اگر در حال بارگذاری بود یا پستی برای بارگذاری وجود نداشت، خارج شو
      if (listIsLoading || (!hasMore && !isSearchOrSortChange)) return;

      startTransition(async () => {
        const result = await getAdminPosts({
          s: searchQuery,
          sortBy: sortBy,
          page: currentPage,
        });

        if (result.posts) {
          // اگر تغییر جستجو یا مرتب‌سازی بود، لیست را بازنویسی کن
          if (isSearchOrSortChange) {
            setPosts(result.posts);
          } else {
            // در غیر این صورت، پست‌های جدید را به انتهای لیست اضافه کن
            setPosts((prevPosts) => [...prevPosts, ...result.posts]);
          }
          setHasMore(result.hasMore);
        }
      });
    },
    [searchQuery, sortBy, listIsLoading, hasMore]
  );

  // افکت برای واکشی اولیه و همچنین هنگام تغییر جستجو یا مرتب‌سازی
  useEffect(() => {
    setPosts([]); // خالی کردن لیست فعلی
    setPage(1); // بازنشانی صفحه به ۱
    setHasMore(true); // بازنشانی hasMore
    fetchPosts(1, true); // واکشی صفحه اول و اطلاع به تابع که این یک تغییر بزرگ است
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortBy]); // این افکت فقط باید با تغییر جستجو و مرتب‌سازی اجرا شود

  const handleLoadMore = () => {
    if (hasMore && !listIsLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const handleSelectPost = async (postSummary) => {
    if (selectedPost?.ID === postSummary.ID && selectedPost.ID !== undefined)
      return;
    setIsFormLoading(true);
    setSelectedPost(null);
    const fullPostData = await getPostById(postSummary.ID);
    if (fullPostData) {
      setSelectedPost(fullPostData);
    } else {
      console.error("خطا: اطلاعات کامل پست دریافت نشد.");
      setSelectedPost(null);
    }
    setIsFormLoading(false);
  };

  const handleCancel = () => setSelectedPost(null);
  const handleNewPost = () => setSelectedPost({});

  // تابع برای به‌روزرسانی لیست پس از ثبت فرم
  const handleFormSubmit = (submittedPost) => {
    // بازخوانی کل لیست برای نمایش تغییرات
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);

    if (submittedPost.deleted) {
      setSelectedPost(null);
    } else {
      setSelectedPost(submittedPost);
    }
  };

  return (
    <main className="flex w-full h-screen bg-[var(--background-primary)] text-[var(--foreground-primary)] overflow-hidden">
      <div
        className={`h-full flex-col border-l border-[var(--border-primary)] transition-transform duration-300 ease-in-out w-full md:w-[320px] lg:w-[360px] md:flex-shrink-0 ${
          selectedPost ? "hidden md:flex" : "flex"
        }`}
      >
        <PostsList
          posts={posts}
          selectedPostId={selectedPost?.ID}
          isLoading={listIsLoading && page === 1} // لودینگ کلی فقط برای بار اول نمایش داده شود
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSelectPost={handleSelectPost}
          onNewPost={handleNewPost}
          // --- پراپ‌های جدید برای اسکرول بی‌نهایت ---
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isFetchingNextPage={listIsLoading && page > 1} // لودینگ صفحه بعدی
        />
      </div>
      <div
        className={`h-full flex flex-col flex-1 ${
          selectedPost ? "flex" : "hidden md:flex"
        }`}
      >
        {isFormLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-[var(--foreground-muted)] p-8">
            <p>در حال بارگذاری اطلاعات پست...</p>
          </div>
        ) : selectedPost ? (
          <PostForm
            key={selectedPost.ID || "new"}
            post={selectedPost}
            onFormSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <div className="flex-col items-center justify-center h-full text-center text-[var(--foreground-muted)] p-8 hidden md:flex">
            <Newspaper size={64} className="mb-4" />
            <h3 className="text-xl font-bold text-[var(--foreground-primary)]">
              هنوز پستی انتخاب نشده است
            </h3>
            <p className="mt-2">
              برای شروع، یک پست را از لیست انتخاب کنید یا یک{" "}
              <button
                onClick={handleNewPost}
                className="text-[var(--accent-primary)] font-semibold hover:underline"
              >
                پست جدید
              </button>{" "}
              ایجاد کنید.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
