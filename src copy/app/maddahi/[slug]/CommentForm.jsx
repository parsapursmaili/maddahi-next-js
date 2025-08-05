// app/componenet/comments.js
"use client";

import { useTransition } from "react";
import { submitComment } from "@/app/maddahi/actions/submitComment";
import { useState } from "react";
import {
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
  User,
  Mail,
} from "lucide-react";

const Comment = ({ postId }) => {
  const [isPending, startTransition] = useTransition();
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("postId", postId);

    setSubmissionStatus(null); // Reset status on new submission

    startTransition(async () => {
      const result = await submitComment(formData);
      setSubmissionStatus(result);

      if (result.success) {
        e.target.reset();
        setTimeout(() => setSubmissionStatus(null), 6000); // Hide success message after 6 seconds
      }
      // Error message will persist until user tries again
    });
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-[var(--foreground-primary)] mb-6 text-center">
        شما هم نظر خود را بنویسید
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* فیلد نام با آیکون */}
          <div className="relative">
            <User className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-muted)]" />
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full pr-12 pl-4 py-3 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--foreground-primary)] placeholder-[var(--foreground-muted)] focus:ring-2 focus:ring-offset-0 focus:ring-[var(--accent-crystal-highlight)]/80 focus:border-[var(--accent-primary)] transition-all duration-200 outline-none"
              placeholder="نام شما (ضروری)"
            />
          </div>
          {/* فیلد ایمیل با آیکون */}
          <div className="relative">
            <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-muted)]" />
            <input
              type="email"
              id="email"
              name="email"
              className="w-full pr-12 pl-4 py-3 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--foreground-primary)] placeholder-[var(--foreground-muted)] focus:ring-2 focus:ring-offset-0 focus:ring-[var(--accent-crystal-highlight)]/80 focus:border-[var(--accent-primary)] transition-all duration-200 outline-none"
              placeholder="ایمیل (اختیاری)"
            />
          </div>
        </div>

        {/* فیلد متن نظر */}
        <div>
          <label htmlFor="commentText" className="sr-only">
            متن نظر
          </label>
          <textarea
            id="commentText"
            name="commentText"
            rows="5"
            required
            className="w-full px-4 py-3 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--foreground-primary)] placeholder-[var(--foreground-muted)] focus:ring-2 focus:ring-offset-0 focus:ring-[var(--accent-crystal-highlight)]/80 focus:border-[var(--accent-primary)] transition-all duration-200 outline-none resize-y"
            placeholder="نظر خود را اینجا بنویسید..."
          ></textarea>
        </div>

        {/* دکمه ارسال بازطراحی شده */}
        <div>
          <button
            type="submit"
            disabled={isPending}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-5 border border-transparent rounded-lg shadow-lg text-base font-semibold text-black transition-all duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0
              ${
                isPending
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-crystal-highlight)] hover:shadow-xl hover:shadow-[var(--accent-primary)]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-crystal-highlight)]"
              }`}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>در حال ارسال...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>ارسال دیدگاه</span>
              </>
            )}
          </button>
        </div>

        {/* پیام وضعیت ارسال با طراحی بهتر */}
        {submissionStatus && (
          <div
            className={`flex items-center justify-center gap-3 mt-4 text-center font-medium text-sm p-4 rounded-lg animate-fade-in
            ${
              submissionStatus.success
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {submissionStatus.success ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <span>{submissionStatus.message}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Comment;
