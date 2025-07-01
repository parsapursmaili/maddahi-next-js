"use client";

import { useState } from "react";

const Comment = ({ postId }) => {
  // `postId` رو به عنوان یک prop می‌پذیره
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
      // **اینجا باید کد واقعی ارسال کامنت به API سرور رو اضافه کنید.**
      // **مثال (نیاز به پیاده‌سازی مسیر API در Next.js دارید):**
      /*
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, name, email, commentText }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit comment');
      }
      */

      // برای دمو، فقط لاگ می‌کنیم
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
    <div className="w-full p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        نظر خود را بنویسید
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            نام شما
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-base"
            placeholder="نام خود را وارد کنید"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            ایمیل شما (اختیاری)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-base"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="commentText"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            متن نظر
          </label>
          <textarea
            id="commentText"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows="6"
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out resize-y text-base"
            placeholder="نظر خود را اینجا بنویسید..."
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-5 border border-transparent rounded-lg shadow-md text-lg font-semibold text-white transition duration-300 ease-in-out transform hover:-translate-y-0.5
              ${
                isSubmitting
                  ? "bg-indigo-600 opacity-70 cursor-not-allowed"
                  : "bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
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

        {submissionStatus === "success" && (
          <p className="mt-4 text-center text-green-400 font-medium text-sm">
            نظر شما با موفقیت ارسال شد!
          </p>
        )}
        {submissionStatus === "error" && (
          <p className="mt-4 text-center text-red-400 font-medium text-sm">
            خطایی در ارسال نظر رخ داد. لطuraفا دوباره تلاش کنید.
          </p>
        )}
      </form>
    </div>
  );
};

export default Comment;
