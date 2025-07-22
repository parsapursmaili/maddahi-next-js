// /app/components/admin/PostsManager.js
"use client"; // <<-- این کامپوننت، کلاینت است

import { useState, useEffect, useCallback, useTransition } from "react";
import { Newspaper } from "lucide-react";

import PostForm from "./PostForm"; // مسیر را چک کنید
import PostsList from "./PostsList"; // مسیر را چک کنید
import getPosts from "@/app/actions/getPost";

export default function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("0");
  const [isLoading, startTransition] = useTransition();

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

  const handleSelectPost = (post) => {
    const fullPostData = {
      ...post,
      categories: post.cat?.map((c) => c.ID) || [],
      tags: post.tag?.map((t) => t.ID) || [],
    };
    setSelectedPost(fullPostData);
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
    <main className="flex h-screen bg-[var(--background-primary)] text-[var(--foreground-primary)]">
      <PostsList
        posts={posts}
        selectedPostId={selectedPost?.ID}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onSelectPost={handleSelectPost}
        onNewPost={handleNewPost}
      />
      <div className="w-full md:w-2/3 flex flex-col h-full">
        {selectedPost ? (
          <PostForm
            key={selectedPost.ID || "new"}
            post={selectedPost}
            onFormSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-[var(--foreground-muted)] p-8">
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
