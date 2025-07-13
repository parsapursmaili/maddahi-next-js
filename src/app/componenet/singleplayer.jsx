"use client";
import "@/app/css/singlepost.css"; // فایل CSS برای استایل نوار پیشرفت
import React, { useRef, useState, useEffect } from "react";

const MusicPlayer = ({ audioSrc }) => {
  const audioRef = useRef(null);
  const timeLineRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // تابع به‌روزرسانی نوار پیشرفت
  const updateProgress = () => {
    if (audioRef.current && timeLineRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      timeLineRef.current.style.setProperty('--progress', `${progress}%`);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    updateProgress();
  };

  const formatTime = (time = 0) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };
  
  const handleDownload = () => {
    if (audioSrc) {
      const link = document.createElement("a");
      link.href = audioSrc;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  useEffect(() => {
    const audio = audioRef.current;
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      updateProgress();
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div
      style={{ direction: "ltr" }}
      className="flex w-full max-w-2xl items-center justify-between gap-3 rounded-xl bg-slate-800/50 p-3 shadow-lg backdrop-blur-md ring-1 ring-white/10 sm:gap-4 sm:p-4"
    >
      {/* دکمه پخش/توقف */}
      <button
        className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 text-xl cursor-pointer rounded-full bg-sky-500/80 text-white transition-all duration-300 ease-in-out hover:bg-sky-500 hover:scale-105 shadow-md"
        onClick={handlePlayPause}
        aria-label={isPlaying ? "مکث" : "پخش"}
      >
        <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
      </button>

      {/* زمان فعلی */}
      <span className="font-mono text-xs sm:text-sm text-slate-400 w-12 text-center">
        {formatTime(currentTime)}
      </span>

      {/* نوار پیشرفت */}
      <div className="flex-grow">
        <input
          type="range"
          ref={timeLineRef}
          min="0"
          max="100"
          value={(currentTime / duration) * 100 || 0}
          onInput={handleSeek}
          className="music-progress w-full h-2 cursor-pointer appearance-none rounded-full outline-none"
        />
      </div>

      {/* مدت زمان کل */}
      <span className="font-mono text-xs sm:text-sm text-slate-400 w-12 text-center">
        {formatTime(duration)}
      </span>
      
      {/* دکمه دانلود */}
      <button
        className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 text-lg flex-shrink-0 cursor-pointer rounded-full bg-slate-700/60 text-slate-300 transition-all duration-300 ease-in-out hover:bg-slate-700 hover:text-white"
        onClick={handleDownload}
        aria-label="دانلود آهنگ"
      >
        <i className="fas fa-download"></i>
      </button>

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
      ></audio>
    </div>
  );
};

export default MusicPlayer;