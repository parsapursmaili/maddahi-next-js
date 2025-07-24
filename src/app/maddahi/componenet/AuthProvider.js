"use client";

import { createContext, useContext } from "react";

// ۱. یک Context برای نگهداری وضعیت می‌سازیم
const AuthContext = createContext({ isAuthenticated: false });

// ۲. Provider که وضعیت را از Layout می‌گیرد و فراهم می‌کند
export function AuthProvider({ children, isAuthenticated }) {
  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// ۳. هوک سفارشی برای دسترسی آسان در کامپوننت‌های کلاینت
export function useAuth() {
  return useContext(AuthContext);
}
