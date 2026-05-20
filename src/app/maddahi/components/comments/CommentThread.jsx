"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import ReplyForm from "./ReplyForm";

// ★★★ ۳. کامپوننت داخلی CommentItem اکنون postType را به عنوان prop دریافت می‌کند ★★★
function CommentItem({ comment, postId, postType }) {
  const [isReplying, setIsReplying] = useState(false);
  const hasReplies = comment.children && comment.children.length > 0;

  return (
    <div className="flex gap-3">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--success)] text-lg font-bold text-white ring-2 ring-[var(--background-primary)]/50">
        {comment.name ? comment.name.charAt(0) : "؟"}
      </span>
      <div className="flex-grow">
        <div className="rounded-xl bg-[var(--background-primary)]/60 p-4 border border-[var(--border-primary)] transition-colors duration-300">
          <div className="flex items-baseline justify-between mb-2">
            <p className="font-semibold text-[var(--accent-primary)] text-base">
              {comment.name || "کاربر ناشناس"}
            </p>
            <p className="text-[var(--foreground-muted)] text-xs font-mono">
              {new Date(comment.created_at).toLocaleDateString("fa-IR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <p className="text-[var(--foreground-secondary)] leading-relaxed text-sm whitespace-pre-wrap mb-3">
            {comment.text}
          </p>
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--accent-primary)] transition-colors"
          >
            <MessageSquare size={14} />
            <span>{isReplying ? "لغو پاسخ" : "پاسخ"}</span>
          </button>
        </div>

        {isReplying && (
          <div className="mt-4 animate-fade-in">
            {/* ★★★ ۴. (نکته حیاتی) پراپ postType به ReplyForm پاس داده می‌شود ★★★ */}
            <ReplyForm
              postId={postId}
              parentId={comment.id}
              postType={postType} // این خط مشکل را حل می‌کند
              onSubmitted={() => setIsReplying(false)}
            />
          </div>
        )}

        {hasReplies && (
          <div className="mt-4 pl-4 md:pl-6 border-r-2 border-dashed border-[var(--border-secondary)]">
            {/* ★★★ ۵. پراپ postType در فراخوانی بازگشتی نیز پاس داده می‌شود (برای پاسخ به پاسخ‌ها) ★★★ */}
            <CommentThread
              comments={comment.children}
              postId={postId}
              postType={postType}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ★★★ ۱. کامپوننت اصلی CommentThread اکنون postType را به عنوان prop دریافت می‌کند ★★★
export default function CommentThread({ comments, postId, postType }) {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        // ★★★ ۲. پراپ postType از اینجا به کامپوننت داخلی CommentItem پاس داده می‌شود ★★★
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          postType={postType}
        />
      ))}
    </div>
  );
}
