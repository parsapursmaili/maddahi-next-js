// app/componenet/auth/AuthWrapper.jsx
"use client"; // <-- مهم: این یک کامپوننت کلاینت است

import { useState, useEffect } from "react";
import { isAuthenticated } from "@/app/actions/auth"; // همان Server Action قبلی
import AdminToolbar from "@/app/componenet/admin/AdminToolbar";

export default function AuthWrapper() {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // پس از بارگذاری صفحه در کلاینت، وضعیت کاربر را بررسی کن
    async function checkAuth() {
      const authStatus = await isAuthenticated();
      setIsAuth(authStatus);
      setIsLoading(false);
    }
    checkAuth();
  }, []); // فقط یک بار اجرا شود

  // تا زمانی که در حال بررسی هستیم، چیزی نشان نده (یا یک لودر کوچک)
  if (isLoading) {
    return null;
  }

  // اگر کاربر احراز هویت شده بود، نوار ادمین را نشان بده
  return isAuth ? <AdminToolbar /> : null;
}
