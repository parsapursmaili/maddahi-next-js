// app/layout.js

import "./globals.css";
import TopLoader from "./componenet/topLoader";
import { Geist, Geist_Mono } from "next/font/google";
import { vazir } from "./font";
import Header from "@/app/maddahi/componenet/Header";
import AuthWrapper from "@/app/maddahi/componenet/AuthWrapper";
// ۱. کامپوننت Script را از next/script وارد کنید
import Script from "next/script";

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

        {/* ۲. اسکریپت‌های گوگل آنالیتیکس را اینجا، قبل از بستن تگ body قرار دهید */}
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XSH630MRCH`}
        />

        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-XSH630MRCH');
          `}
          <Script id="microsoft-clarity" strategy="lazyOnload">
            {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "srhbd3kuzu");
          `}
          </Script>
        </Script>
      </body>
    </html>
  );
}
