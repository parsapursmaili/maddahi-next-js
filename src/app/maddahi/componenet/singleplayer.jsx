"use client";
import "@/app/maddahi/css/singlepost.css";
import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Download } from "lucide-react"; // وارد کردن آیکون‌ها

const MusicPlayer = ({ audioSrc }) => {
  const audioRef = useRef(null);
  const timeLineRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [n, setn] = useState(0);
  const [h, seth] = useState(0);

  const handleprogress = () => {
    const percent =
      ((audioRef.current.currentTime / duration) * 100).toFixed(4) + "%";

    timeLineRef.current.style.setProperty("--progress", percent);
  };

  const canplay = () => {
    setDuration(audioRef.current.duration);
    if (!h) return;
    setn(1);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (!n) {
      seth(1);
      audioRef.current.load();
      setIsPlaying(!isPlaying);
      return;
    }
    if (!audioRef.current.paused) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 10000) * duration;
    audioRef.current.currentTime = newTime;
    handleTimeUpdate();
  };

  const formatTime = (time = 0) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const handleDownload = async () => {
    if (!audioSrc) return;

    try {
      // 1. دریافت فایل صوتی از لینک به صورت یک شیء Blob
      const response = await fetch(audioSrc);
      const blob = await response.blob();

      // 2. ایجاد یک URL موقت برای Blob در حافظه مرورگر
      const url = window.URL.createObjectURL(blob);

      // 3. ایجاد یک لینک دانلود مخفی
      const link = document.createElement("a");
      link.href = url;

      // 4. استخراج نام فایل از URL یا استفاده از یک نام پیش‌فرض
      const fileName = audioSrc.split("/").pop() || "download.mp3";
      link.setAttribute("download", fileName);

      // 5. افزودن لینک به صفحه، کلیک روی آن و سپس حذف لینک
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 6. آزاد کردن حافظه اشغال شده توسط URL موقت
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("خطا در دانلود فایل:", error);
      // در صورت بروز خطا، می‌توان از روش قدیمی به عنوان جایگزین استفاده کرد
      const link = document.createElement("a");
      link.href = audioSrc;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    handleprogress();
  };

  return (
    <div
      style={{ direction: "ltr" }}
      className="flex w-full max-w-2xl items-center justify-between gap-3 rounded-xl bg-[var(--background-secondary)/50] p-3 shadow-lg backdrop-blur-md ring-1 ring-[var(--border-primary)] sm:gap-4 sm:p-4"
    >
      {/* Play/Pause Button */}
      <button
        className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 cursor-pointer rounded-full bg-[var(--accent-primary)] text-[var(--background-primary)] transition-all duration-300 ease-in-out hover:opacity-90 hover:scale-105 shadow-md"
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {/* ---- تغییر در این قسمت ---- */}
        {isPlaying ? (
          <Pause size={22} fill="currentColor" />
        ) : (
          <Play size={22} fill="currentColor" className="ml-1" />
        )}
      </button>

      {/* Current Time */}
      <span className="font-mono text-xs sm:text-sm text-[var(--foreground-muted)] w-12 text-center">
        {formatTime(currentTime)}
      </span>

      {/* Progress Bar */}
      <div className="flex-grow">
        <input
          type="range"
          ref={timeLineRef}
          min="0"
          max="10000"
          value={
            audioRef.current && duration
              ? (audioRef.current.currentTime / duration) * 10000
              : 0
          }
          onInput={handleSeek}
          className="music-progress w-full h-2 cursor-pointer appearance-none rounded-full outline-none"
        />
      </div>

      {/* Total Duration */}
      <span className="font-mono text-xs sm:text-sm text-[var(--foreground-muted)] w-12 text-center">
        {formatTime(duration)}
      </span>

      {/* Download Button */}
      <button
        className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 cursor-pointer rounded-full bg-[var(--background-tertiary)]/60 text-[var(--foreground-secondary)] transition-all duration-300 ease-in-out hover:bg-[var(--border-secondary)] hover:text-[var(--foreground-primary)]"
        onClick={handleDownload}
        aria-label="Download audio"
      >
        {/* ---- تغییر در این قسمت ---- */}
        <Download size={20} />
      </button>

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onCanPlay={canplay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          audioRef.current.play();
        }}
      ></audio>
    </div>
  );
};
export default MusicPlayer;
