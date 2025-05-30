"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../css/home2.css";

const Slider = ({ slides }) => {
  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={16}
        slidesPerView={3}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 12 },
          768: { slidesPerView: 6, spaceBetween: 16 },
          1024: { slidesPerView: 12, spaceBetween: 0 },
        }}
        className="w-full pb-16"
      >
        {slides && slides.length > 0 ? (
          slides.map((post) => (
            <SwiperSlide key={post.id}>
              <div className="flex flex-col  items-center">
                {post.thumb ? (
                  <Image
                    src={`https://besooyeto.ir/maddahi/wp-content/uploads/${
                      post.thumb.split(".")[0]
                    }-150x150.${post.thumb.split(".")[1]}`}
                    alt={post.post_title || "پست"}
                    width={100}
                    height={100}
                    className="rounded-3xl object-cover "
                  />
                ) : (
                  <div className=" bg-gray-600 rounded-full flex items-center justify-center text-gray-300 text-xs">
                    بدون تصویر
                  </div>
                )}
                <h3 className="mt-2 text-xs max-w-27 text-gray-100 text-center">
                  {post.post_title}
                </h3>
              </div>
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className="h-48 flex items-center justify-center text-gray-300">
              هیچ پستی یافت نشد
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
};

export default Slider;
