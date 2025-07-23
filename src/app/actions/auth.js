// app/actions/auth.js
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin-auth-token";

export async function isAuthenticated() {
  const cookieStore = cookies();
  const authToken = cookieStore.get(COOKIE_NAME)?.value;
  return authToken === process.env.ADMIN_AUTH_SECRET;
}

/**
 * Server Action برای ورود کاربر با قابلیت بازگرداندن وضعیت خطا.
 * @param {object} prevState - وضعیت قبلی فرم (برای useFormState).
 * @param {FormData} formData - داده‌های فرم ارسالی.
 */
export async function login(prevState, formData) {
  const password = formData.get("password");
  const rememberMe = formData.get("remember-me");

  // ۱. بررسی رمز عبور
  if (password !== process.env.ADMIN_PASSWORD) {
    // بازگرداندن پیام خطا برای نمایش در فرم
    return { success: false, message: "رمز عبور وارد شده اشتباه است." };
  }

  // ۲. تعیین زمان انقضای کوکی
  const maxAgeInSeconds = rememberMe === "on" ? 720 * 60 * 60 : 1 * 60 * 60; // 30 روز یا 1 ساعت

  // ۳. تنظیم کوکی
  cookies().set(COOKIE_NAME, process.env.ADMIN_AUTH_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeInSeconds,
  });

  // ۴. هدایت کاربر فقط در صورت موفقیت
  redirect("/admin");
}

export async function logout() {
  cookies().delete(COOKIE_NAME);
}
