// app/layout.js

import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { vazir } from "./font";
import Header from "@/app/componenet/Header";
import { Suspense } from "react";
import { isAuthenticated } from "@/app/actions/auth";
import AdminToolbar from "@/app/componenet/admin/AdminToolbar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "به سوی تو - موزیک پلیر",
  description: "پخش و دانلود جدیدترین نماهنگ‌ها",
  robots: "noindex, nofollow",
};

export default async function RootLayout({ children }) {
  // ۱. وضعیت احراز هویت را یک بار در سرور با حداکثر سرعت بررسی می‌کنیم.
  const isAuth = await isAuthenticated();
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-..."
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isAuth && <AdminToolbar />}
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
