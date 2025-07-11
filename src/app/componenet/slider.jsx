"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../css/home2.css"; // اطمینان حاصل کنید که استایل‌های سفارشی اعمال می‌شوند

const Slider = ({ slides }) => {
  return (
    // به کانتینر اصلی گروه اضافه شده تا هاور روی کل اسلایدر (برای نمایش دکمه‌ها) کار کند
    <div className="relative group/slider container mx-auto px-4">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={24} // فضای بیشتر برای جلوه‌ی بهتر
        slidesPerView={2}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        pagination={{ clickable: true, el: ".swiper-pagination-custom" }}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 7 },
        }}
        className="!pb-20" // افزایش padding پایین برای دات‌های پِیجینیشن
      >
        {slides && slides.length > 0 ? (
          slides.map((post) => (
            <SwiperSlide key={post.ID} style={{ perspective: "1000px" }}>
              {/* کامپوننت Link برای ناوبری صحیح در Next.js */}
              <Link href={`/${post.ID}`} className="group block">
                {/* کانتینر اصلی برای افکت گرادیانت در حاشیه */}
                <div
                  className="relative rounded-2xl p-px bg-gradient-to-br from-cyan-500/0 via-violet-500/0 to-transparent transition-all duration-500 group-hover:from-cyan-500/70 group-hover:via-violet-500/70 group-hover:to-cyan-500/70"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* محتوای داخلی کارت با پس‌زمینه تیره */}
                  <div className="relative h-full w-full rounded-[15px] bg-slate-900/80 backdrop-blur-sm p-4 flex flex-col items-center gap-4 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-x-[-5deg]">
                    {/* کانتینر تصویر دایره‌ای */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-600 to-violet-600 opacity-0 transition-opacity duration-500 group-hover:opacity-30 blur-md"></div>
                      {post.thumbnail ? (
                        <Image
                          src={`https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}`}
                          alt={post.title || "تصویر پست"}
                          fill
                          className="rounded-full object-cover ring-2 ring-white/10 transition-all duration-500 group-hover:ring-cyan-400/50"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-gray-500 text-xs font-mono ring-2 ring-white/10">
                          بدون تصویر
                        </div>
                      )}
                    </div>

                    {/* نمایش کامل عنوان و تراز وسط برای هماهنگی ارتفاع */}
                    <div className="h-16 flex items-center justify-center text-center">
                      <h3 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors duration-300 line-clamp-3">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className="h-48 flex items-center justify-center text-gray-500">
              هیچ پست مشابهی یافت نشد
            </div>
          </SwiperSlide>
        )}
      </Swiper>
      {/* دکمه‌های ناوبری و پِیجینیشن سفارشی */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
        <div className="swiper-pagination-custom flex gap-2" />
      </div>
      <div className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-0 w-11 h-11 flex items-center justify-center bg-black/40 rounded-full text-white backdrop-blur-sm cursor-pointer transition-all duration-300 opacity-0 group-hover/slider:opacity-100 group-hover/slider:-left-4 z-10 hover:bg-cyan-500/30"></div>
      <div className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-0 w-11 h-11 flex items-center justify-center bg-black/40 rounded-full text-white backdrop-blur-sm cursor-pointer transition-all duration-300 opacity-0 group-hover/slider:opacity-100 group-hover/slider:-right-4 z-10 hover:bg-cyan-500/30"></div>
    </div>
  );
};

export default Slider;
