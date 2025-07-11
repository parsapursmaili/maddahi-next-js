// components/MusicPlayer.jsx
"use client";
import "@/app/css/singlepost.css"; // فایل CSS آپدیت شده در پایین قرار دارد
import React, { useRef, useState, useEffect, useCallback } from "react";

const MusicPlayer = ({
  audioSrc = "https://dl.besooyeto.ir/maddahi/javad-moghadam/%D9%86%D9%85%D8%A7%D9%87%D9%86%DA%AF%20%D8%A7%D8%B0%D8%A7%D9%86%20%D9%86%D8%AC%D9%81.mp3",
}) => {
  const audioRef = useRef(null);
  const timeLine = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // تابع آپدیت نوار پیشرفت با استایل جدید
  function handleTimeUpdate() {
    const progress = (audioRef.current.currentTime / duration) * 100;
    if (timeLine.current) {
      timeLine.current.value = progress * 100; // مقدار بین 0 تا 10000
      // استفاده از رنگ فیروزه‌ای (cyan) برای هماهنگی با تم
      const cyanColor = "#22d3ee"; // کد هگز رنگ فیروزه‌ای از Tailwind
      timeLine.current.style.backgroundImage = `linear-gradient(to right, ${cyanColor} ${progress}%, #4b5563 0%)`;
    }
  }

  function handlePlay() {
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current.pause();
      return;
    }
    setIsPlaying(true);
    audioRef.current.play();
  }

  function handleChange() {
    const newTime = (timeLine.current.value / 10000) * duration;
    setCurrentTime(newTime);
    handleTimeUpdate();
    audioRef.current.currentTime = newTime;
  }

  function formatTime(time = 0) {
    const minutes = Math.floor(time / 60);
    const secondsLeft = Math.floor(time % 60);
    return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
  }

  const handleDownload = () => {
    if (audioSrc) {
      const link = document.createElement("a");
      link.href = audioSrc;
      // برای دانلود مستقیم فایل به جای باز کردن در تب جدید
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    // کانتینر اصلی با استایل شیشه‌ای (Glassmorphism) و هماهنگ با تم
    <div
      style={{ direction: "ltr" }}
      // در حالت پیش‌فرض (موبایل)، flex-col و در sm به بعد flex-row
      className="flex w-full max-w-2xl items-center justify-between gap-2 rounded-xl bg-black/30 p-2 shadow-lg backdrop-blur-sm ring-1 ring-white/10 sm:gap-4 sm:p-3"
    >
      {/* دکمه پخش/توقف با استایل مدرن */}
      <div
        // اندازه آیکون در موبایل کوچکتر
        className="flex items-center justify-center h-9 w-9 text-lg cursor-pointer rounded-full bg-white/10 text-cyan-300 transition-all duration-300 ease-in-out hover:bg-white/20 hover:text-white hover:scale-110
                   sm:h-11 sm:w-11 sm:text-xl" // در sm به بعد بزرگتر
        onClick={handlePlay}
        role="button"
        aria-label={isPlaying ? "مکث آهنگ" : "پخش آهنگ"}
      >
        <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
      </div>

      {/* زمان فعلی */}
      <span className="font-mono text-xs text-slate-400 w-10 text-center sm:text-sm sm:w-12">
        {formatTime(currentTime)}
      </span>

      {/* نوار پیشرفت */}
      <div className="flex-grow">
        <input
          type="range"
          ref={timeLine}
          min="0"
          max="10000"
          defaultValue="0"
          onChange={handleChange}
          // ارتفاع و طول نوار در موبایل و دسکتاپ
          className="music-progress h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none sm:h-2"
        />
      </div>

      {/* مدت زمان کل */}
      <span className="font-mono text-xs text-slate-400 w-10 text-center sm:text-sm sm:w-12">
        {formatTime(duration)}
      </span>

      {/* دکمه دانلود با استایل مدرن */}
      <button
        // اندازه آیکون در موبایل کوچکتر
        className="flex items-center justify-center h-10 w-10 flex-shrink-0 cursor-pointer rounded-full bg-white/15 text-xl text-cyan-300 transition-all duration-300 ease-in-out hover:bg-white/25 hover:text-white hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75
                   sm:h-12 sm:w-12 sm:text-2xl" // در sm به بعد بزرگتر
        onClick={handleDownload}
        aria-label="دانلود آهنگ"
      >
        <i className="fas fa-download"></i>
      </button>

      <audio
        loop
        ref={audioRef}
        src={audioSrc}
        preload="none"
        onLoadedMetadata={() => {
          setDuration(audioRef.current.duration);
        }}
        onTimeUpdate={() => {
          setCurrentTime(audioRef.current.currentTime);
          handleTimeUpdate();
        }}
        onEnded={() => setIsPlaying(false)}
      ></audio>
    </div>
  );
};

export default MusicPlayer;
