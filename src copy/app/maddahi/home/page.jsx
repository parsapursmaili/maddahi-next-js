// app/page.jsx
import getPosts from "@/app/maddahi/actions/getPost";
import MaddahiClientPage from "./MaddahiClientPage";
import "@/app/maddahi/css/home.css";

// متادیتای ثابت برای صفحه اصلی
export const metadata = {
  title: "دانلود و پخش آنلاین مداحی | آرشیو کامل به سوی تو",
  description:
    "گنجینه‌ای کامل از هزاران مداحی صوتی و تصویری از مداحان برجسته. بر اساس مداح, مناسبت (محرم، فاطمیه و...) فیلتر کنید، آنلاین گوش دهید یا با کیفیت بالا دانلود نمایید.",
  openGraph: {
    title: "دانلود و پخش آنلاین مداحی | آرشیو کامل به سوی تو",
    description:
      "گنجینه‌ای کامل از هزاران مداحی صوتی و تصویری از مداحان برجسته.",
    url: "https://besooyeto.ir/maddahi/home", // آدرس سایت شما
    siteName: "به سوی تو",
    images: [
      {
        url: "https://besooyeto.ir/default-og-image.jpg", // آدرس تصویر پیش‌فرض برای اشتراک‌گذاری
        width: 1200,
        height: 630,
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "دانلود و پخش آنلاین مداحی | آرشیو کامل به سوی تو",
    description:
      "گنجینه‌ای کامل از هزاران مداحی صوتی و تصویری از مداحان برجسته.",
    images: ["https://besooyeto.ir/default-og-image.jpg"], // آدرس تصویر پیش‌فرض
  },
};

// این یک کامپوننت سرور است
export default async function Home({ searchParams }) {
  const page = Number(searchParams?.page) || 1;
  const maddah = Number(searchParams?.maddah) || 0;
  const monasebat = Number(searchParams?.monasebatha) || 0;
  const rand = Number(searchParams?.rand) || 0;
  const s = searchParams?.s || "";

  const initialFilter = {
    page,
    maddah,
    monasebat,
    rand,
    s,
    terms: 1,
  };

  const initialData = await getPosts(initialFilter);
  const initialPosts = initialData.post || [];
  const initialTotal = initialData.total || 0;

  return (
    <MaddahiClientPage
      initialPosts={initialPosts}
      initialTotal={initialTotal}
      initialSearchParams={initialFilter}
    />
  );
}
