// app/components/SliderConcept11.js
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./SliderConcept.css";
import "swiper/css";
import "swiper/css/navigation";

// توجه: انیمیشن این اسلایدر به چند خط کد در فایل CSS گلوبال شما نیاز دارد.
// کد مورد نیاز در فایل SliderConcept11.css جدید قرار داده شده است.

const SliderConcept11 = ({ slides, sliderId }) => {
  const nextButtonClass = `swiper-button-next-${sliderId}`;
  const prevButtonClass = `swiper-button-prev-${sliderId}`;

  return (
    <div className="relative group/slider container mx-auto px-4">
      <Swiper
        modules={[Navigation]}
        spaceBetween={24}
        slidesPerView={2}
        navigation={{
          nextEl: `.${nextButtonClass}`,
          prevEl: `.${prevButtonClass}`,
        }}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 20 },
          768: { slidesPerView: 4, spaceBetween: 24 },
          1024: { slidesPerView: 5, spaceBetween: 24 },
          1280: { slidesPerView: 6, spaceBetween: 24 },
        }}
        className="!py-4" // !py-4 برای نمایش بهتر سایه‌ها و glow effect
        dir="rtl"
      >
        {slides.map((post) => (
          <SwiperSlide key={post.ID}>
            <Link
              href={`/maddahi/${post.name}`}
              // group اصلی برای کنترل تمام افکت‌های هاور داخلی
              className="group relative block rounded-2xl bg-[#171717] p-1 overflow-hidden z-[1]"
            >
              {/* افکت درخشان نئونی که انیمیشن آن در CSS باقی‌مانده است */}
              <div className="neon-glow absolute inset-0 rounded-2xl p-0.5 w-full bg-[conic-gradient(from_var(--angle),#262626,#00b4a0,#a3fff4,#00b4a0,#262626)] opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-in-out z-[-1] animate-spin-slow group-hover:[animation-play-state:running]"></div>

              {/* محتوای داخلی کارت */}
              <div className="relative bg-[#171717] rounded-xl p-4 flex flex-col items-center gap-4 h-full">
                <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                  {post.thumbnail ? (
                    <Image
                      src={`/uploads/${encodeURI(post.thumbnail)}`}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-400 ease-in-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#262626] text-[#525252]">
                      بی‌تصویر
                    </div>
                  )}
                </div>
                <div className="h-16 flex items-center justify-center text-center px-2">
                  <h3 className="text-sm font-medium leading-snug text-[#a3a3a3] transition-colors duration-300 group-hover:text-[#f5f6f7] line-clamp-3">
                    {post.title}
                  </h3>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* دکمه‌های ناوبری اسلایدر */}
      <div
        className={`${nextButtonClass} slider-nav-button left-0 group-hover/slider:-translate-x-4 md:-translate-x-5`}
      >
        <FaChevronLeft />
      </div>
      <div
        className={`${prevButtonClass} slider-nav-button right-0 group-hover/slider:translate-x-4 md:translate-x-5`}
      >
        <FaChevronRight />
      </div>
    </div>
  );
};

export default SliderConcept11;
