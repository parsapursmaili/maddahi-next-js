"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";
// می‌توانید از همان فایل CSS اسلایدر قبلی برای دکمه‌ها استفاده کنید
import "./SliderConcept.css";
import "swiper/css";
import "swiper/css/navigation";

const SliderWithViews = ({ slides, sliderId }) => {
  const nextButtonClass = `swiper-button-next-${sliderId}`;
  const prevButtonClass = `swiper-button-prev-${sliderId}`;

  return (
    <div className="relative group/slider container mx-auto px-4">
      <Swiper
        modules={[Navigation]}
        spaceBetween={24}
        slidesPerView={1.5}
        navigation={{
          nextEl: `.${nextButtonClass}`,
          prevEl: `.${prevButtonClass}`,
        }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 24 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
        }}
        className="!p-1"
        dir="rtl"
      >
        {slides.map((post) => (
          <SwiperSlide key={post.ID}>
            <Link
              href={`/maddahi/${post.name}`}
              className="group block relative rounded-2xl overflow-hidden aspect-[3/4] transition-all duration-300 ring-1 ring-transparent hover:ring-[var(--accent-crystal-highlight)]/50"
            >
              {/* تصویر پس‌زمینه */}
              {post.thumbnail ? (
                <Image
                  src={`https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}`}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">
                  بی‌تصویر
                </div>
              )}

              {/* لایه گرادینت برای خوانایی بهتر متن */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              {/* پنل شیشه‌ای برای محتوا */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-lg border-t border-[var(--accent-crystal-highlight)]/20">
                <h3 className="font-semibold text-base text-[var(--foreground-primary)] line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-[var(--foreground-secondary)]">
                  <FaEye />
                  <span>{Number(post.view || 0).toLocaleString("fa-IR")}</span>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* دکمه‌های ناوبری */}
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

export default SliderWithViews;
