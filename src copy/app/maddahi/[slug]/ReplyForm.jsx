// app/components/comments/ReplyForm.jsx
"use client";

import { useTransition, useState } from "react";
import { submitComment } from "@/app/maddahi/actions/submitComment";
import { Send, Loader2 } from "lucide-react";

export default function ReplyForm({ postId, parentId, onSubmitted }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("postId", postId);
    formData.append("parentId", parentId);

    startTransition(async () => {
      const result = await submitComment(formData);
      if (result.success) {
        e.target.reset();
        if (onSubmitted) onSubmitted();
        alert(result.message); // یا نمایش یک پیام کوچک و زیبا
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-4 rounded-lg bg-[var(--background-secondary)]/70 border border-[var(--border-primary)]"
    >
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-1/2 px-3 py-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-sm outline-none"
          placeholder="نام شما"
        />
        <button
          type="submit"
          disabled={isPending || !name}
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
