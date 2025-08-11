"use client";

import { useTransition, useState } from "react";
// ★★★ ۱. اصلاح مسیر: مسیر صحیح اکشن عمومی را وارد می‌کنیم ★★★
import { submitComment } from "@/app/maddahi/actions/submitComment";
import { Send, Loader2 } from "lucide-react";

export default function ReplyForm({ postId, parentId, postType, onSubmitted }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    startTransition(async () => {
      const result = await submitComment(formData);
      if (result.success) {
        e.target.reset();
        if (onSubmitted) onSubmitted();
        // در صورت تمایل می‌توانید اینجا یک پیام موفقیت (toast) نمایش دهید
      } else {
        // نمایش خطا به کاربر
        alert(result.message);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-4 rounded-lg bg-[var(--background-secondary)]/70 border border-[var(--border-primary)]"
    >
      {/* ★★★ ۲. تغییر کلیدی: اضافه کردن فیلدهای مخفی برای ارسال داده‌های ضروری ★★★ */}
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="parentId" value={parentId} />
      <input type="hidden" name="postType" value={postType} />

      <textarea
        name="commentText"
        rows="3"
        required
        className="w-full px-3 py-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--foreground-primary)] placeholder-[var(--foreground-muted)] focus:ring-1 focus:ring-[var(--accent-crystal-highlight)]/80 outline-none"
        placeholder="پاسخ خود را بنویسید..."
      ></textarea>
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          name="name"
          required
          className="flex-grow px-3 py-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-sm outline-none"
          placeholder="نام شما"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-lg text-xs font-semibold text-black bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-crystal-highlight)] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span>ارسال پاسخ</span>
        </button>
      </div>
    </form>
  );
}
