"use client";
import { useState } from "react";

const Comment = ({ postId }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(""); // success, error, ''

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Comment Submitted:", { postId, name, email, commentText });

      setSubmissionStatus("success");
      setName("");
      setEmail("");
      setCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      setSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows="5"
            required
            className="w-full px-4 py-2.5 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--foreground-primary)] placeholder-[var(--foreground-muted)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-all duration-200 outline-none resize-y"
            placeholder="نظر خود را اینجا بنویسید..."
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-5 border border-transparent rounded-lg shadow-md text-base font-semibold text-[var(--background-primary)] transition-all duration-300 ease-in-out transform hover:-translate-y-1
              ${
                isSubmitting
                  ? "bg-[var(--accent-primary)/70] cursor-not-allowed"
                  : "bg-[var(--accent-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] focus:ring-[var(--accent-primary)]"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
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
              submissionStatus === "success"
                ? "text-[var(--success)]"
                : "text-[var(--error)]"
            }`}
          >
            {submissionStatus === "success"
              ? "نظر شما با موفقیت ارسال شد!"
              : "خطایی در ارسال نظر رخ داد. لطفا دوباره تلاش کنید."}
          </p>
        )}
      </form>
    </div>
  );
};

export default Comment;
