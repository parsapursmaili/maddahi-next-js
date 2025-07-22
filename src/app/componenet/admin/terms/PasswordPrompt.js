// /app/components/admin/PasswordPrompt.js (یا مسیر مشابه)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // <-- ایمپورت useRouter
import { checkPassword } from "@/app/actions/auth";

export default function PasswordPrompt() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // <-- استفاده از هوک

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // اکشن جدید شما یک آبجکت برمی‌گرداند
      const result = await checkPassword(password);

      // <<-- شرط حیاتی: بررسی پراپرتی success
      if (result.success) {
        // پس از ورود موفق، به جای تغییر state، صفحه را رفرش می‌کنیم.
        // این کار باعث می‌شود کامپوننت سرور والد دوباره اجرا شود و وضعیت
        // احراز هویت را بر اساس کوکی جدید بررسی کند.
        router.refresh();
      } else {
        setError(result.message || "رمز عبور وارد شده اشتباه است.");
        setPassword("");
      }
    } catch (err) {
      setError("خطایی در ارتباط با سرور رخ داد.");
    } finally {
      setIsLoading(false);
    }
  };

  // کدهای JSX فرم بدون تغییر باقی می‌ماند
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background-primary)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[var(--background-secondary)] rounded-lg shadow-lg border border-[var(--border-primary)]">
        <h1 className="text-2xl font-bold text-center text-[var(--foreground-primary)]">
          ورود به پنل مدیریت
        </h1>
        <p className="text-center text-[var(--foreground-secondary)]">
          برای دسترسی به این صفحه، لطفا رمز عبور را وارد کنید.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--foreground-secondary)]"
            >
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 block w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--foreground-primary)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-crystal-highlight)] focus:border-[var(--accent-primary)] transition"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="text-sm text-center text-[var(--error)]">{error}</p>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[var(--accent-primary)] hover:bg-[var(--accent-crystal-highlight)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? "در حال بررسی..." : "ورود"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
