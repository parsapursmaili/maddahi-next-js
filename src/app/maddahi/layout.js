// app/layout.js

import "./globals.css";
import TopLoader from "./componenet/topLoader";
import { Geist, Geist_Mono } from "next/font/google";
import { vazir } from "./font";
import Header from "@/app/maddahi/componenet/Header";
import AuthWrapper from "@/app/maddahi/componenet/AuthWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "به سوی تو-مداحی",
  description:
    "مرکز مداحی ها و نماهنگ ها در وبسایت به سوی تو برای علاقه مندان به آثار مداحان اهل بیت",
  icons: {
    icon: [
      {
        url: "/favicon.webp",
        type: "image/webp",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    // اینجا از suppressHydrationWarning استفاده کنید
    <html
      lang="fa"
      dir="rtl"
      className={vazir.variable}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TopLoader />
        <AuthWrapper />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
