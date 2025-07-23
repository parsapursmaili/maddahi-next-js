"use client";

import { useTransition } from "react";
import { submitComment } from "@/app/actions/submitComment"; // مسیر را چک کنید
import { useState } from "react";

const Comment = ({ postId }) => {
  // useTransition برای مدیریت حالت pending بدون بلاک کردن UI
  const [isPending, startTransition] = useTransition();
  const [submissionStatus, setSubmissionStatus] = useState(null); // { success: boolean, message: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("postId", postId); // شناسه پست را به داده‌های فرم اضافه می‌کنیم

    setSubmissionStatus(null); // پاک کردن پیام قبلی

    startTransition(async () => {
      const result = await submitComment(formData);
      setSubmissionStatus(result);

      // اگر ارسال موفقیت‌آمیز بود، فرم را ریست کن
      if (result.success) {
        e.target.reset();
      }
    });
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[var(--foreground-primary)] mb-6 text-center">
        نظر خود را بنویسید
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2"
            >
              نام شما
            </label>
            <input
              type="text"
              id="name"
              name="name" // پراپرتی name برای FormData ضروری است
              required
              className="w-full px-4 py-2.5 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--foreground-primary)] placeholder-[var(--foreground-muted)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-all duration-200 outline-none"
              placeholder="نام خود را وارد کنید"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2"
            >
              ایمیل (اختیاری)
            </label>
            <input
              type="email"
              id="email"
              name="email" // پراپرتی name برای FormData ضروری است
              className="w-full px-4 py-2.5 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--foreground-primary)] placeholder-[var(--foreground-muted)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-all duration-200 outline-none"
              placeholder="example@email.com"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="commentText"
            className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2"
          >
            متن نظر
          </label>
          <textarea
            id="commentText"
            name="commentText" // پراپرتی name برای FormData ضروری است
            rows="5"
            required
            className="w-full px-4 py-2.5 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--foreground-primary)] placeholder-[var(--foreground-muted)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-all duration-200 outline-none resize-y"
            placeholder="نظر خود را اینجا بنویسید..."
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className={`w-full flex justify-center py-3 px-5 border border-transparent rounded-lg shadow-md text-base font-semibold text-[var(--background-primary)] transition-all duration-300 ease-in-out transform hover:-translate-y-1
              ${
                isPending
                  ? "bg-[var(--accent-primary)/70] cursor-not-allowed"
                  : "bg-[var(--accent-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] focus:ring-[var(--accent-primary)]"
              }`}
          >
            {isPending ? (
              <span className="flex items-center">
                {/* SVG for loading indicator */}
                در حال ارسال...
              </span>
            ) : (
              "ارسال نظر"
            )}
          </button>
        </div>

        {submissionStatus && (
          <p
            className={`mt-4 text-center font-medium text-sm ${
              submissionStatus.success
                ? "text-[var(--success)]"
                : "text-[var(--error)]"
            }`}
          >
            {submissionStatus.message}
          </p>
        )}
      </form>
    </div>
  );
};

export default Comment;
