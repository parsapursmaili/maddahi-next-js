"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// این فایل CSS برای استایل‌دهی به نقاط Pagination استفاده می‌شود
import "../css/home2.css";

const Slider = ({ slides }) => {
  return (
    // کانتینر اصلی اسلایدر
    <div className="relative group/slider container mx-auto px-4">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={24}
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
        className="!pb-16" // فضای کافی برای صفحه‌بندی
      >
        {slides && slides.length > 0 ? (
          slides.map((post) => (
            <SwiperSlide key={post.ID} style={{ perspective: "1000px" }}>
              <Link href={`/${post.ID}`} className="group block">
                {/* کانتینر کارت با حاشیه گرادیانتی در حالت هاور */}
                <div
                  className="relative rounded-2xl p-px bg-gradient-to-br from-transparent via-transparent to-transparent transition-all duration-300 group-hover:from-sky-500/80 group-hover:to-indigo-500/80"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* محتوای داخلی کارت */}
                  <div className="relative h-full w-full rounded-[15px] bg-slate-800/80 backdrop-blur-sm p-4 flex flex-col items-center gap-4 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-x-[-7deg]">
                    {/* کانتینر تصویر */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 opacity-0 transition-opacity duration-500 group-hover:opacity-20 blur-lg"></div>
                      {post.thumbnail ? (
                        <Image
                          src={`https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}`}
                          alt={post.title || "تصویر پست"}
                          fill
                          className="rounded-full object-cover ring-1 ring-slate-700 transition-all duration-500 group-hover:ring-sky-400/60"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-700 rounded-full flex items-center justify-center text-slate-500 text-xs font-mono ring-1 ring-slate-600">
                          بدون تصویر
                        </div>
                      )}
                    </div>

                    {/* عنوان پست */}
                    <div className="h-16 flex items-center justify-center text-center">
                      <h3 className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300 line-clamp-3">
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
            <div className="h-48 flex items-center justify-center text-slate-500">
              هیچ پست مشابهی یافت نشد
            </div>
          </SwiperSlide>
        )}
      </Swiper>
      {/* دکمه‌های ناوبری سفارشی */}
      <div className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-0 w-11 h-11 flex items-center justify-center bg-slate-800/60 rounded-full text-white backdrop-blur-sm cursor-pointer transition-all duration-300 opacity-0 group-hover/slider:opacity-100 group-hover/slider:-translate-x-4 z-10 hover:bg-sky-500/40">
        <FaChevronLeft />
      </div>
      <div className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-0 w-11 h-11 flex items-center justify-center bg-slate-800/60 rounded-full text-white backdrop-blur-sm cursor-pointer transition-all duration-300 opacity-0 group-hover/slider:opacity-100 group-hover/slider:translate-x-4 z-10 hover:bg-sky-500/40">
        <FaChevronRight />
      </div>
      {/* کانتینر صفحه‌بندی سفارشی */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
        <div className="swiper-pagination-custom flex gap-2" />
      </div>
    </div>
  );
};

export default Slider;
