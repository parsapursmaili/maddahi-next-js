"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";
import { createApiImageUrl } from "@/app/maddahi/lib/utils/imageUrl"; // ۱. وارد کردن تابع کمکی
import "./SliderConcept.css";
import "swiper/css";
import "swiper/css/navigation";

const SliderWithViews = ({ slides, sliderId }) => {
  const nextButtonClass = `swiper-button-next-${sliderId}`;
  const prevButtonClass = `swiper-button-prev-${sliderId}`;

  return (
    <div className="relative group/slider">
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={1.5}
        navigation={{
          nextEl: `.${nextButtonClass}`,
          prevEl: `.${prevButtonClass}`,
        }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 24 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
          1280: { slidesPerView: 5, spaceBetween: 24 },
        }}
        className="!p-1"
        dir="rtl"
      >
        {slides.map((post) => {
          // ۲. فراخوانی تابع کمکی برای ساخت URL
          const imageUrl = createApiImageUrl(post.thumbnail, {
            size: "560",
          }); // انتخاب سایز مناسب‌تر برای این اسلایدر

          return (
            <SwiperSlide key={post.ID}>
              <Link
                href={`/maddahi/${post.name}`}
                className="group block relative rounded-2xl overflow-hidden aspect-[3/4] transition-all duration-300 ring-1 ring-transparent hover:ring-[var(--accent-crystal-highlight)]/50"
              >
                {/* ۳. استفاده از نتیجه در کامپوننت Image */}
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" // پراپ sizes برای بهینه‌سازی حفظ شده
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">
                    بی‌تصویر
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-lg border-t border-[var(--accent-crystal-highlight)]/20">
                  <h3 className="font-semibold text-base text-[var(--foreground-primary)] line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-[var(--foreground-secondary)]">
                    <FaEye />
                    <span>
                      {Number(post.view || 0).toLocaleString("fa-IR")}
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div
        className={`${nextButtonClass} slider-nav-button left-0 opacity-0 group-hover/slider:opacity-100 group-hover/slider:-translate-x-4`}
      >
        <FaChevronLeft />
      </div>
      <div
        className={`${prevButtonClass} slider-nav-button right-0 opacity-0 group-hover/slider:opacity-100 group-hover/slider:translate-x-4`}
      >
        <FaChevronRight />
      </div>
    </div>
  );
};

export default SliderWithViews;
