// components/MusicPlayer.jsx
"use client"; // این خط برای کامپوننت‌های سمت کلاینت در App Router ضروری است
import "@/app/css/singlepost.css";
import React, { useRef, useState, useEffect, useCallback } from "react";

const MusicPlayer = ({
  audioSrc = "https://dl.besooyeto.ir/maddahi/javad-moghadam/%D9%86%D9%85%D8%A7%D9%87%D9%86%DA%AF%20%D8%A7%D8%B0%D8%A7%D9%86%20%D9%86%D8%AC%D9%81.mp3",
}) => {
  const audioRef = useRef(null); // Ref برای دسترسی به المنت <audio>
  const timeLine = useRef(null); // Ref برای دسترسی به المنت <input type="range">

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function handleTimeUpdate() {
    timeLine.current.value = (audioRef.current.currentTime / duration) * 10000;
    const val = (audioRef.current.currentTime / duration) * 100;
    timeLine.current.style.backgroundImage = `linear-gradient(to right, #00C853 ${
      val + 0.2
    }%, #ddd 0%)`;
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
    setCurrentTime((timeLine.current.value / 10000) * duration);
    audioRef.current.currentTime = (timeLine.current.value / 10000) * duration;
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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      style={{ direction: "ltr" }}
      className=" flex items-center justify-center p-4 md:p-[15px] md:px-5
                 bg-gray-800 bg-opacity-30 rounded-lg w-[90%] max-w-xl mx-auto
                 shadow-lg md:shadow-md"
    >
      <i
        className={`inline-flex items-center justify-center text-gray-700 text-lg md:text-xl
                   p-2.5 md:p-3 rounded-[20%] bg-gray-200 bg-opacity-80
                   shadow-md cursor-pointer hover:text-gray-100 hover:bg-teal-600
                   transition-all duration-300 transform hover:scale-105 ${
                     isPlaying ? "fas fa-pause" : "fas fa-play"
                   }`}
        onClick={handlePlay}
        role="button"
        aria-label={isPlaying ? "مکث آهنگ" : "پخش آهنگ"} // برای دسترسی‌پذیری
      ></i>
      <span className="text-white text-sm md:text-[15px] mx-2.5 md:mx-4 ">
        {formatTime(currentTime)}
      </span>
      {/* Progress Bar */}
      <div className="flex-grow max-w-[calc(100%-160px)] md:max-w-md">
        <input
          type="range"
          ref={timeLine}
          min="0"
          max="10000"
          onChange={handleChange}
          className="music-progress appearance-none w-full h-[7px] md:h-[6px]
                     rounded-lg outline-none cursor-pointer
                     bg-gradient-to-r from-green-500 to-green-500" 
        />
      </div>

      {/* Duration Time Display */}
      <span className="text-white text-sm md:text-[15px] mx-2.5 md:mx-4 ">
        {formatTime(duration)}
      </span>

      {
        <i
          className="fas fa-download inline-flex items-center justify-center text-gray-700 text-lg md:text-xl
                     p-2.5 md:p-3 rounded-[20%] bg-gray-200 bg-opacity-80
                     shadow-md cursor-pointer hover:text-gray-100 hover:bg-teal-600
                     transition-all duration-300 transform hover:scale-105"
          onClick={handleDownload}
          role="button" // برای دسترسی‌پذیری
          aria-label="دانلود آهنگ" // برای دسترسی‌پذیری
        ></i>
      }

      {/* Hidden Audio Element */}
      <audio
        loop
        ref={audioRef}
        src={audioSrc}
        //onError={audioRef.current.load()}
        preload="metadata"
        onLoadedMetadata={() => {
          setDuration(audioRef.current.duration);
        }}
        onTimeUpdate={() => {
          setCurrentTime(audioRef.current.currentTime);
          handleTimeUpdate();
        }}
      ></audio>
    </div>
  );
};

export default MusicPlayer;
