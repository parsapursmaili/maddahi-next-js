"use client";

import { Swiper, SwiperSlide } from "swiper/react";
// ۱. ماژول FreeMode را در کنار Navigation وارد کنید
import { Navigation, FreeMode } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { createApiImageUrl } from "@/app/maddahi/lib/utils/imageUrl";
import "./SliderConcept.css";
import "swiper/css";
import "swiper/css/navigation";
// ۲. استایل‌های مربوط به FreeMode را وارد کنید (اختیاری اما پیشنهادی)
import "swiper/css/free-mode";

const SliderConcept11 = ({ slides, sliderId }) => {
  const nextButtonClass = `swiper-button-next-${sliderId}`;
  const prevButtonClass = `swiper-button-prev-${sliderId}`;

  return (
    <div className="relative group/slider container mx-auto px-4">
      <Swiper
        // ۳. ماژول FreeMode را به لیست ماژول‌ها اضافه کنید
        modules={[FreeMode, Navigation]}
        // ۴. حالت آزاد را فعال کنید
        freeMode={true}
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
        className="!py-4"
        dir="rtl"
      >
        {slides.map((post) => {
          const imageUrl = createApiImageUrl(post.thumbnail, {
            size: "150",
          });

          return (
            <SwiperSlide key={post.ID}>
              <Link
                href={`/maddahi/${post.name}`}
                className="group relative block rounded-2xl bg-[#171717] p-1 overflow-hidden z-[1]"
              >
                <div className="neon-glow absolute inset-0 rounded-2xl p-0.5 w-full bg-[conic-gradient(from_var(--angle),#262626,#00b4a0,#a3fff4,#00b4a0,#262626)] opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-in-out z-[-1] animate-spin-slow group-hover:[animation-play-state:running]"></div>
                <div className="relative bg-[#171717] rounded-xl p-4 flex flex-col items-center gap-4 h-full">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
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
          );
        })}
      </Swiper>
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
