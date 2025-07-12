import "./globals.css";
import NProgressIndicator from "@/app/componenet/NProgressIndicator";
import { Geist, Geist_Mono } from "next/font/google";
import { vazir } from "./font"; // فرض بر اینکه فایل فونت وزیر را به درستی تنظیم کرده‌اید
import Header from "@/app/componenet/Header"; // وارد کردن کامپوننت هدر
import { Suspense } from "react";
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
  robots: "noindex, nofollow", // در زمان انتشار سایت این را تغییر دهید
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <head>
        {/* Font Awesome قبلا اضافه شده و عالی است */}
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
        <Header /> {/* کامپوننت هدر اینجا قرار می‌گیرد */}
        <Suspense fallback={null}>
          <NProgressIndicator />
        </Suspense>
        <main>{children}</main> {/* محتوای صفحات در تگ main قرار می‌گیرد */}
      </body>
    </html>
  );
}
