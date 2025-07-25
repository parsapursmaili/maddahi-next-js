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
};

// تابع دیگر async نیست و کاملاً استاتیک است
export default function RootLayout({ children }) {
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
        <main>{children}</main>
      </body>
    </html>
  );
}
