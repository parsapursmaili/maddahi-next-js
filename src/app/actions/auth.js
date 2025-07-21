"use server";

import { cookies } from "next/headers";

// خواندن متغیرها از فایل .env.local
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_AUTH_SECRET = process.env.ADMIN_AUTH_SECRET;
const COOKIE_NAME = "admin-auth-token";

/**
 * رمز عبور ورودی کاربر را بررسی کرده و در صورت صحت، یک کوکی امن تنظیم می‌کند.
 */
export async function checkPassword(password) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, message: "رمز عبور وارد شده اشتباه است." };
  }

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, ADMIN_AUTH_SECRET, {
    // HttpOnly: مهم‌ترین ویژگی امنیتی در این روش!
    // از دسترسی کدهای جاوااسکریپت (مانند حملات XSS) به کوکی جلوگیری می‌کند.
    httpOnly: true,

    // Secure: کوکی فقط از طریق اتصال امن HTTPS ارسال شود.
    // در محیط پروداکشن برای جلوگیری از حملات مرد میانی (MitM) حیاتی است.
    secure: process.env.NODE_ENV === "production",

    // SameSite=Strict: بهترین گزینه برای جلوگیری از حملات CSRF.
    // کوکی فقط زمانی ارسال می‌شود که درخواست از دامنه خود سایت باشد.
    sameSite: "strict",

    // path: کوکی در تمام مسیرهای سایت در دسترس باشد.
    path: "/",

    // maxAge: عمر کوکی به ثانیه.
    // 60 * 60 * 24 = 86400 ثانیه (معادل یک روز کامل)
    // نکته: maxAge به ثانیه است، نه میلی‌ثانیه. کد شما این بخش را اشتباه محاسبه می‌کرد.
    maxAge: 60 * 60 * 24 * 30,
  });

  return { success: true };
}

/**
 * تابع مرکزی برای بررسی اعتبار کاربر در کامپوننت‌های سرور.
 * این تابع کوکی را می‌خواند و مقدار آن را با کلید مخفی مقایسه می‌کند.
 * این همان تابعی است که در تمام صفحات ادمین خود از آن استفاده خواهید کرد.
 */
export async function verifyAdmin() {
  const cookieStore = cookies();
  const authToken = cookieStore.get(COOKIE_NAME)?.value;

  // اگر توکن وجود نداشت یا با کلید مخفی ما برابر نبود، کاربر احراز هویت نشده است.
  if (!authToken || authToken !== ADMIN_AUTH_SECRET) {
    return false;
  }

  // اگر همه چیز درست بود، کاربر مجاز است.
  return true;
}

/**
 * کاربر را با حذف کوکی از سیستم خارج می‌کند.
 */
export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
