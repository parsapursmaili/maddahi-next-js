"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaMicrophoneAlt } from "react-icons/fa"; // ۱. آیکون میکروفون را وارد کنید
import { createApiImageUrl } from "@/app/maddahi/lib/utils/imageUrl";

import "./SliderCardView.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

const SliderCardView = ({ slides, sliderId }) => {
  const nextButtonClass = `swiper-button-next-${sliderId}`;
  const prevButtonClass = `swiper-button-prev-${sliderId}`;

  return (
    <div className="relative group/slider w-full">
      <Swiper
        modules={[FreeMode, Navigation]}
        freeMode={true}
        navigation={{
          nextEl: `.${nextButtonClass}`,
          prevEl: `.${prevButtonClass}`,
        }}
        slidesPerView={3}
        spaceBetween={12}
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
          const imageUrl = createApiImageUrl(post.thumbnail, { size: "250" });

          return (
            <SwiperSlide key={post.ID}>
              <Link
                href={`/maddahi/${post.name}`}
                className="block outline-none group"
              >
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[--background-tertiary] transition-transform duration-300 ease-out group-hover:scale-105">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    // ۲. بلوک جایگزین تصویر با طراحی جدید
                    <div className="placeholder-card w-full h-full flex items-center justify-center">
                      <FaMicrophoneAlt className="text-5xl text-[--foreground-muted]" />
                    </div>
                  )}

                  {/* این بخش فقط در صورت وجود تصویر، گرادینت را نمایش می‌دهد */}
                  {imageUrl && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                    <h3 className="text-xs font-medium leading-snug text-[--foreground-primary] line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className={`${nextButtonClass} slider-nav-button left-4`}>
        <FaChevronLeft />
      </div>
      <div className={`${prevButtonClass} slider-nav-button right-4`}>
        <FaChevronRight />
      </div>
    </div>
  );
};

export default SliderCardView;
