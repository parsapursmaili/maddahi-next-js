// /app/components/admin/PostsManager.js
"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Newspaper } from "lucide-react";

import PostForm from "./PostForm";
import PostsList from "./PostsList";
import getPosts from "@/app/maddahi/actions/getPost";
import getPostById from "@/app/maddahi/actions/getPostById";

export default function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("0");
  const [listIsLoading, startTransition] = useTransition();
  const [isFormLoading, setIsFormLoading] = useState(false);

  const fetchPosts = useCallback(() => {
    startTransition(async () => {
      const result = await getPosts({
        s: searchQuery,
        rand: sortBy,
        page: 1,
        terms: 1,
      });
      if (result.post) {
        setPosts(result.post);
      }
    });
  }, [searchQuery, sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

  const handleFormSubmit = (submittedPost) => {
    fetchPosts();
    if (submittedPost.deleted) {
      setSelectedPost(null);
    } else {
      setSelectedPost(submittedPost);
    }
  };

  return (
    <main className="flex w-full h-screen bg-[var(--background-primary)] text-[var(--foreground-primary)] overflow-hidden">
      {/* 
        ستون لیست پست‌ها (سایدبار)
        *** تغییر اصلی: عرض از 1/3 به 1/4 کاهش یافت ***
      */}
      <div
        className={`h-full flex-col border-l border-[var(--border-primary)] transition-transform duration-300 ease-in-out w-full md:w-1/4 md:flex-shrink-0 ${
          selectedPost ? "hidden md:flex" : "flex"
        }`}
      >
        <PostsList
          posts={posts}
          selectedPostId={selectedPost?.ID}
          isLoading={listIsLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSelectPost={handleSelectPost}
          onNewPost={handleNewPost}
        />
      </div>

      {/* 
        ستون فرم / پیام اولیه (محتوای اصلی)
        *** تغییر اصلی: عرض از 2/3 به 3/4 افزایش یافت ***
      */}
      <div
        className={`h-full flex-col w-full md:w-3/4 md:flex-shrink-0 ${
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
