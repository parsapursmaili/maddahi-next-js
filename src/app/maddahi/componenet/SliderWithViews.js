"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";
import "./SliderConcept.css";
import "swiper/css";
import "swiper/css/navigation";

const SliderWithViews = ({ slides, sliderId }) => {
  const nextButtonClass = `swiper-button-next-${sliderId}`;
  const prevButtonClass = `swiper-button-prev-${sliderId}`;

  return (
    // !!! بهینه‌سازی: حذف کلاس‌های container mx-auto px-4 از اینجا !!!
    <div className="relative group/slider">
      <Swiper
        modules={[Navigation]}
        spaceBetween={16} // کمی فاصله کمتر در موبایل
        slidesPerView={1.5}
        navigation={{
          nextEl: `.${nextButtonClass}`,
          prevEl: `.${prevButtonClass}`,
        }}
        breakpoints={{
          // نقاط شکست برای نمایش تعداد اسلاید متفاوت
          640: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 24 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
          1280: { slidesPerView: 5, spaceBetween: 24 }, // یک نقطه شکست اضافی برای صفحات بزرگتر
        }}
        className="!p-1" // کمی پدینگ برای جلوگیری از بریده شدن ring در حالت hover
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
                  src={`/uploads/${encodeURI(post.thumbnail)}`}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" // بهینه سازی بارگذاری تصویر
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
