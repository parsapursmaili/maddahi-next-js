"use client";
import "@/app/maddahi/css/singlepost.css";
import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Download,
  Loader,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const MusicPlayer = ({ audioSrc }) => {
  const audioRef = useRef(null);
  const timeLineRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [n, setn] = useState(0);
  const [h, seth] = useState(0);
  const [downloadState, setDownloadState] = useState("idle");
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
    // اگر در حال دانلود بود، کاری نکن
    if (!audioSrc || downloadState === "loading") return;

    setDownloadState("loading"); // 1. تغییر وضعیت به "در حال دانلود"

    try {
      const response = await fetch(audioSrc);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // 2. حل مشکل نام فایل فارسی
      const fileName = decodeURIComponent(
        audioSrc.split("/").pop() || "download.mp3"
      );
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadState("success"); // 3. تغییر وضعیت به "موفق"
    } catch (error) {
      console.error("خطا در دانلود فایل:", error);
      setDownloadState("error"); // 4. تغییر وضعیت به "خطا"
    } finally {
      // 5. بازگرداندن دکمه به حالت اولیه پس از 3 ثانیه
      setTimeout(() => {
        setDownloadState("idle");
      }, 3000);
    }
  };

  const DownloadIcon = () => {
    switch (downloadState) {
      case "loading":
        return <Loader size={20} className="animate-spin" />;
      case "success":
        return <CheckCircle size={20} className="text-green-500" />;
      case "error":
        return <AlertTriangle size={20} className="text-red-500" />;
      default:
        return <Download size={20} />;
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
        className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 cursor-pointer rounded-full bg-[var(--background-tertiary)]/60 text-[var(--foreground-secondary)] transition-all duration-300 ease-in-out hover:bg-[var(--border-secondary)] hover:text-[var(--foreground-primary)] disabled:opacity-60 disabled:cursor-wait"
        onClick={handleDownload}
        aria-label="Download audio"
        disabled={downloadState === "loading"} // دکمه در حین دانلود غیرفعال می‌شود
      >
        <DownloadIcon />
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
