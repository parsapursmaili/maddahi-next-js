// app/layout.js

import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { vazir } from "./font";
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
        </Script>
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "srhbd3kuzu");
          `}
        </Script>
      </body>
    </html>
  );
}
