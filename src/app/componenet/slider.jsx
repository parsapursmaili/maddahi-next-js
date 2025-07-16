// app/componenet/slider.js
"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../css/home2.css";

// تغییر: دریافت sliderId به عنوان پراپ
const Slider = ({ slides, sliderId }) => {
  // تغییر: ساختن کلاس‌های منحصر به فرد بر اساس sliderId
  const nextButtonClass = `swiper-button-next-${sliderId}`;
  const prevButtonClass = `swiper-button-prev-${sliderId}`;
  const paginationClass = `swiper-pagination-${sliderId}`;

  return (
    <div className="relative group/slider container mx-auto px-4">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={2}
        // تغییر: استفاده از کلاس‌های منحصر به فرد برای ناوبری و صفحه‌بندی
        navigation={{
          nextEl: `.${nextButtonClass}`,
          prevEl: `.${prevButtonClass}`,
        }}
        pagination={{ clickable: true, el: `.${paginationClass}` }}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 7 },
        }}
        className="!pb-16"
        dir="rtl" // اضافه کردن این پراپ برای اطمینان از عملکرد صحیح در حالت RTL
      >
        {slides && slides.length > 0 ? (
          slides.map((post) => (
            <SwiperSlide key={post.ID} style={{ perspective: "1000px" }}>
              <Link href={`/${post.name}`} className="group block">
                <div
                  className="relative rounded-2xl p-px bg-gradient-to-br from-transparent via-transparent to-transparent transition-all duration-300 group-hover:from-[var(--accent-primary)/80] group-hover:to-[var(--success)/80]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="relative h-full w-full rounded-[15px] bg-[var(--background-secondary)]/80 backdrop-blur-sm p-4 flex flex-col items-center gap-4 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-x-[-7deg]">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--success)] opacity-0 transition-opacity duration-500 group-hover:opacity-20 blur-lg"></div>
                      {post.thumbnail ? (
                        <Image
                          src={`https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}`}
                          alt={post.title || "تصویر پست"}
                          fill
                          className="rounded-full object-cover ring-1 ring-[var(--border-primary)] transition-all duration-500 group-hover:ring-[var(--accent-primary)/60]"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--background-tertiary)] rounded-full flex items-center justify-center text-[var(--foreground-muted)] text-xs font-mono ring-1 ring-[var(--border-secondary)]">
                          بدون تصویر
                        </div>
                      )}
                    </div>
                    <div className="h-16 flex items-center justify-center text-center">
                      <h3 className="text-sm font-medium text-[var(--foreground-secondary)] group-hover:text-[var(--foreground-primary)] transition-colors duration-300 line-clamp-3">
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
            <div className="h-48 flex items-center justify-center text-[var(--foreground-muted)]">
              هیچ پست مشابهی یافت نشد
            </div>
          </SwiperSlide>
        )}
      </Swiper>

      {/* تغییر برای RTL: دکمه سمت چپ، دکمه "بعدی" (Next) است */}
      <div
        className={`${nextButtonClass} absolute top-1/2 -translate-y-1/2 left-0 w-11 h-11 flex items-center justify-center bg-[var(--background-secondary)]/60 rounded-full text-[var(--foreground-primary)] backdrop-blur-sm cursor-pointer transition-all duration-300 opacity-0 group-hover/slider:opacity-100 group-hover/slider:-translate-x-4 z-10 hover:bg-[var(--accent-primary)/40]`}
      >
        <FaChevronLeft />
      </div>

      {/* تغییر برای RTL: دکمه سمت راست، دکمه "قبلی" (Prev) است */}
      <div
        className={`${prevButtonClass} absolute top-1/2 -translate-y-1/2 right-0 w-11 h-11 flex items-center justify-center bg-[var(--background-secondary)]/60 rounded-full text-[var(--foreground-primary)] backdrop-blur-sm cursor-pointer transition-all duration-300 opacity-0 group-hover/slider:opacity-100 group-hover/slider:translate-x-4 z-10 hover:bg-[var(--accent-primary)/40]`}
      >
        <FaChevronRight />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
        {/* تغییر: استفاده از کلاس منحصر به فرد برای صفحه‌بندی */}
        <div className={`${paginationClass} flex gap-2`} />
      </div>
    </div>
  );
};

export default Slider;
