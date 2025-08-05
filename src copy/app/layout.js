// app/layout.js

import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { vazir } from "./font";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "به سوی تو-هیئت شیعیان",
  description:
    "وبسایت به سوی تو در زمینه ی مداحی ها و نماهنگ های مداحان اهل بیت فعالیت میکند",
  // robots را میتوانید برای محیط پروداکشن بردارید
  icons: {
    icon: [
      {
        url: "/favicon.webp", // فاوآیکون اصلی WebP
        type: "image/webp",
      },
    ],
    // می‌تونی آیکون‌های دیگه مثل Apple Touch Icon رو هم اینجا اضافه کنی:
    // apple: '/apple-touch-icon.png',
  },
};

// تابع دیگر async نیست و کاملاً استاتیک است
export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
