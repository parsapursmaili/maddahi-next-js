// /app/maddahi/components/admin/soogname/PostSelector.js
"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, X, Check } from "lucide-react";
import { searchPostsForSelector } from "@/app/maddahi/actions/soognameActions";
import getPostById from "@/app/maddahi/actions/getPostById";

export default function PostSelector({ selectedPostIds, onChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [isSearching, startSearchTransition] = useTransition();

  // واکشی اطلاعات پست‌های انتخاب‌شده در بارگذاری اولیه
  useEffect(() => {
    const fetchSelectedPosts = async () => {
      const posts = await Promise.all(
        selectedPostIds.map((id) => getPostById(id))
      );
      setSelectedPosts(posts.filter(Boolean)); // filter out any null results
    };
    if (selectedPostIds.length > 0) {
      fetchSelectedPosts();
    }
  }, [selectedPostIds]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.length > 2) {
        startSearchTransition(async () => {
          const results = await searchPostsForSelector(searchQuery);
          setSearchResults(results);
        });
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce search

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSelect = (post) => {
    if (!selectedPostIds.includes(post.ID)) {
      onChange([...selectedPostIds, post.ID]);
      setSelectedPosts((prev) => [...prev, post]);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleDeselect = (postId) => {
    onChange(selectedPostIds.filter((id) => id !== postId));
    setSelectedPosts((prev) => prev.filter((post) => post.ID !== postId));
  };

  return (
    <div>
      {/* Selected Posts */}
      {selectedPosts.length > 0 && (
        <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-[var(--border-secondary)]">
          {selectedPosts.map((post) => (
            <div
              key={post.ID}
              className="flex items-center justify-between gap-2 bg-[var(--background-tertiary)] text-xs px-2 py-1.5 rounded-md"
            >
              <span className="truncate">{post.title}</span>
              <button
                type="button"
                onClick={() => handleDeselect(post.ID)}
                className="rounded-full hover:bg-black/20 p-0.5 transition-colors text-[var(--error)] flex-shrink-0"
                aria-label={`حذف ${post.title}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input and Results */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
          size={16}
        />
        <input
          type="text"
          placeholder="جستجوی پست مرتبط..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-md focus:outline-none focus:border-[var(--accent-primary)] transition-colors text-sm"
        />
        {(isSearching || searchResults.length > 0) && (
          <div className="absolute top-full mt-1 w-full bg-[var(--background-primary)] border border-[var(--border-secondary)] rounded-md z-10 max-h-48 overflow-y-auto">
            {isSearching ? (
              <p className="p-2 text-xs text-center text-[var(--foreground-muted)]">
                در حال جستجو...
              </p>
            ) : (
              <ul>
                {searchResults.map((post) => (
                  <li key={post.ID}>
                    <button
                      type="button"
                      onClick={() => handleSelect(post)}
                      disabled={selectedPostIds.includes(post.ID)}
                      className="w-full text-right text-sm px-3 py-1.5 hover:bg-[var(--background-tertiary)] transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="truncate">{post.title}</span>
                      {selectedPostIds.includes(post.ID) && (
                        <Check
                          size={14}
                          className="text-[var(--success)] flex-shrink-0"
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
