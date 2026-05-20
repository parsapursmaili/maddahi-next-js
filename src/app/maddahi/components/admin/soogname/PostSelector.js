// /app/maddahi/components/admin/soogname/PostSelector.js
"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, X, Check, GripVertical } from "lucide-react";
import { searchPostsForSelector } from "@/app/maddahi/actions/soognameActions";
import getPostById from "@/app/maddahi/actions/getPostById";

// وارد کردن کامپوننت‌ها و هوک‌های لازم از کتابخانه dnd-kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// کامپوننت جداگانه برای هر آیتم قابل مرتب‌سازی
// این کار کد را تمیزتر و مدیریت آن را آسان‌تر می‌کند
function SortablePostItem({ post, onDeselect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // برای استایل‌دهی هنگام درگ
  } = useSortable({ id: post.ID });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // آیتم در حال درگ کمی محو شود
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 bg-[var(--background-tertiary)] text-xs px-2 py-1.5 rounded-md touch-none"
    >
      <div className="flex items-center gap-2">
        {/* این دکمه، دستگیره درگ است */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-[var(--foreground-muted)] active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
        <span className="truncate">{post.title}</span>
      </div>
      <button
        type="button"
        onClick={() => onDeselect(post.ID)}
        className="rounded-full hover:bg-black/20 p-0.5 transition-colors text-[var(--error)] flex-shrink-0"
        aria-label={`حذف ${post.title}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function PostSelector({ selectedPostIds, onChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [isSearching, startSearchTransition] = useTransition();

  // واکشی اطلاعات پست‌های انتخاب‌شده با حفظ ترتیب اولیه
  useEffect(() => {
    const fetchSelectedPosts = async () => {
      // یک Map برای حفظ ترتیب پس از Promise.all
      // چون Promise.all ترتیب آرایه ورودی را حفظ می‌کند اما ما می‌خواهیم مطمئن باشیم
      const postMap = new Map();
      await Promise.all(
        selectedPostIds.map(async (id) => {
          const post = await getPostById(id);
          if (post) {
            postMap.set(id, post);
          }
        })
      );
      // بازسازی آرایه با ترتیب صحیح از روی selectedPostIds
      const orderedPosts = selectedPostIds
        .map((id) => postMap.get(id))
        .filter(Boolean); // حذف موارد null اگر پستی پیدا نشد
      setSelectedPosts(orderedPosts);
    };

    if (selectedPostIds.length > 0) {
      fetchSelectedPosts();
    } else {
      setSelectedPosts([]); // پاک کردن لیست در صورت خالی شدن
    }
  }, [selectedPostIds]);

  // جستجوی پست‌ها (بدون تغییر)
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

  // افزودن یک پست جدید به لیست
  const handleSelect = (post) => {
    if (!selectedPosts.some((p) => p.ID === post.ID)) {
      const newSelectedPosts = [...selectedPosts, post];
      setSelectedPosts(newSelectedPosts);
      // ارسال آرایه جدید ID ها با حفظ ترتیب به فرم اصلی
      onChange(newSelectedPosts.map((p) => p.ID));
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // حذف یک پست از لیست
  const handleDeselect = (postId) => {
    const newSelectedPosts = selectedPosts.filter((post) => post.ID !== postId);
    setSelectedPosts(newSelectedPosts);
    onChange(newSelectedPosts.map((p) => p.ID));
  };

  // سنسورها برای تشخیص درگ (لمسی و موس)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // درگ فقط پس از 8 پیکسل جابجایی فعال شود تا با کلیک تداخل نکند
        distance: 8,
      },
    })
  );

  // تابع برای مدیریت پایان عمل درگ
  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = selectedPosts.findIndex((item) => item.ID === active.id);
      const newIndex = selectedPosts.findIndex((item) => item.ID === over.id);

      const newOrderedPosts = arrayMove(selectedPosts, oldIndex, newIndex);
      setSelectedPosts(newOrderedPosts);

      // آپدیت فرم اصلی با ترتیب جدید ID ها
      onChange(newOrderedPosts.map((p) => p.ID));
    }
  }

  return (
    <div>
      {/* لیست پست‌های انتخاب‌شده که اکنون قابلیت مرتب‌سازی دارند */}
      {selectedPosts.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedPosts.map((p) => p.ID)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-[var(--border-secondary)]">
              {selectedPosts.map((post) => (
                <SortablePostItem
                  key={post.ID}
                  post={post}
                  onDeselect={handleDeselect}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* بخش جستجو و افزودن پست (بدون تغییر ظاهری) */}
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
                      disabled={selectedPosts.some((p) => p.ID === post.ID)}
                      className="w-full text-right text-sm px-3 py-1.5 hover:bg-[var(--background-tertiary)] transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="truncate">{post.title}</span>
                      {selectedPosts.some((p) => p.ID === post.ID) && (
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
