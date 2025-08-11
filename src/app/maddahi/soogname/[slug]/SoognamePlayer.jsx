// /app/soogname/[slug]/SoognamePlayer.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Download,
  Loader,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// کامپوننت دکمه دانلود (کامل و بدون تغییر)
const DownloadButton = ({ audioSrc }) => {
  const [downloadState, setDownloadState] = useState("idle");
  const handleDownload = async () => {
    if (!audioSrc || downloadState === "loading") return;
    setDownloadState("loading");
    try {
      const response = await fetch(audioSrc);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = decodeURIComponent(
        audioSrc.split("/").pop() || "download.mp3"
      );
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloadState("success");
    } catch (error) {
      console.error("Download error:", error);
      setDownloadState("error");
    } finally {
      setTimeout(() => setDownloadState("idle"), 2000);
    }
  };
  const renderIcon = () => {
    switch (downloadState) {
      case "loading":
        return <Loader size={18} className="animate-spin" />;
      case "success":
        return <CheckCircle size={18} className="text-green-400" />;
      case "error":
        return <AlertTriangle size={18} className="text-red-400" />;
      default:
        return <Download size={18} />;
    }
  };
  return (
    <button
      onClick={handleDownload}
      disabled={downloadState === "loading"}
      className="p-2 rounded-full transition-colors duration-300 hover:bg-white/20 disabled:opacity-50"
    >
      {renderIcon()}
    </button>
  );
};

// کامپوننت لودر موج صوتی (کامل و بدون تغییر)
const AudioWaveLoader = () => (
  <div className="flex items-center justify-center h-full w-full gap-1">
    <style jsx>{`
      .wave-bar {
        width: 4px;
        height: 24px;
        background-color: black;
        border-radius: 4px;
        animation: wave-animation 1.2s ease-in-out infinite;
      }
      .wave-bar:nth-child(1) {
        animation-delay: 0s;
      }
      .wave-bar:nth-child(2) {
        animation-delay: 0.2s;
      }
      .wave-bar:nth-child(3) {
        animation-delay: 0.4s;
      }
      @keyframes wave-animation {
        0%,
        40%,
        100% {
          transform: scaleY(0.4);
        }
        20% {
          transform: scaleY(1);
        }
      }
    `}</style>
    <div className="wave-bar"></div>
    <div className="wave-bar"></div>
    <div className="wave-bar"></div>
  </div>
);

export default function SoognamePlayer({ playlist }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoopingOne, setIsLoopingOne] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const currentTrack = playlist[currentTrackIndex];

  // تمام توابع دیگر به صورت کامل و بدون تغییر باقی می‌مانند
  useEffect(() => {
    setIsLoading(true);
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.link;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((e) => console.error("Error playing audio:", e));
      }
    }
  }, [currentTrackIndex, currentTrack]);
  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (audioRef.current.readyState < 3) {
        setIsLoading(true);
      }
      audioRef.current
        .play()
        .catch((e) => console.error("Error playing audio:", e));
    }
    setIsPlaying(!isPlaying);
  };
  const handleNext = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    setIsPlaying(true);
  };
  const handlePrev = () => {
    setCurrentTrackIndex(
      (prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length
    );
    setIsPlaying(true);
  };
  const handleEnded = () => {
    if (isLoopingOne) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      handleNext();
    }
  };
  const handleTimeUpdate = () => {
    const newTime = audioRef.current.currentTime;
    setCurrentTime(newTime);
    if (progressBarRef.current) {
      const newDuration = audioRef.current.duration;
      if (newDuration > 0) {
        progressBarRef.current.style.setProperty(
          "--progress",
          `${(newTime / newDuration) * 100}%`
        );
      }
    }
  };
  const onLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };
  const handleProgressSeek = (e) => {
    if (!duration) return;
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const newTime = (clickPosition / progressBar.offsetWidth) * duration;
    if (progressBarRef.current) {
      progressBarRef.current.style.setProperty(
        "--progress",
        `${(newTime / duration) * 100}%`
      );
    }
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };
  const formatTime = (time) => {
    if (isNaN(time) || time <= 0) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  if (!playlist || playlist.length === 0) {
    return (
      <div className="text-center text-[#a3a3a3] bg-[#171717] p-8 rounded-lg">
        فایل صوتی برای این سوگنامه یافت نشد.
      </div>
    );
  }

  return (
    <div
      style={{ direction: "rtl" }}
      className="w-full bg-[#1a1a1a]/70 backdrop-blur-xl text-white overflow-hidden sm:rounded-2xl"
    >
      <audio
        ref={audioRef}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsPlaying(true);
          setIsLoading(false);
        }}
        onPause={() => setIsPlaying(false)}
        onCanPlay={() => setIsLoading(false)}
        onSeeking={() => setIsLoading(true)}
        onSeeked={() => setIsLoading(false)}
      />

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-grow min-w-0">
            <h3 className="font-bold text-base sm:text-lg truncate">
              {currentTrack.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <DownloadButton audioSrc={currentTrack.link} />
            <button
              onClick={() => setIsLoopingOne(!isLoopingOne)}
              className="p-2 rounded-full transition-colors duration-300 hover:bg-white/20"
            >
              {isLoopingOne ? (
                <Repeat1 size={18} className="text-[#a3fff4]" />
              ) : (
                <Repeat size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{ direction: "ltr" }} className="px-4 sm:px-5 pb-4 sm:pb-5">
        <div className="mt-2">
          <div
            ref={progressBarRef}
            className="music-progress-container relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer group"
            onClick={handleProgressSeek}
          >
            <div
              className="music-progress-bar absolute h-full bg-[#a3fff4] rounded-full group-hover:bg-[#00b4a0] transition-all"
              style={{ width: `var(--progress, 0%)` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-white/50 mt-1.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3">
          {/* ★★★ اصلاح نهایی و ۱۰۰٪ صحیح منطق دکمه‌ها ★★★ */}
          {/* دکمه سمت چپ (ظاهر رو به عقب) -> کارکرد به عقب */}
          <button
            onClick={handleNext}
            className="p-3 rounded-full transition-colors duration-300 hover:bg-white/20 disabled:opacity-50"
            disabled={isLoading}
          >
            <SkipBack fill="currentColor" size={22} />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-16 h-16 flex items-center justify-center bg-[#a3fff4] text-black rounded-full shadow-lg shadow-[#a3fff4]/30 transition-transform hover:scale-105"
          >
            {isLoading ? (
              <AudioWaveLoader />
            ) : isPlaying ? (
              <Pause fill="currentColor" size={30} />
            ) : (
              <Play fill="currentColor" size={30} className="ml-1" />
            )}
          </button>

          {/* دکمه سمت راست (ظاهر رو به جلو) -> کارکرد به جلو */}
          <button
            onClick={handlePrev}
            className="p-3 rounded-full transition-colors duration-300 hover:bg-white/20 disabled:opacity-50"
            disabled={isLoading}
          >
            <SkipForward fill="currentColor" size={22} />
          </button>
        </div>
      </div>

      <div className="bg-black/20 p-2">
        <ul className="space-y-1">
          {playlist.map((track, index) => (
            <li key={track.ID}>
              <button
                onClick={() => {
                  setCurrentTrackIndex(index);
                }}
                className={`w-full text-right p-3 rounded-lg transition-colors duration-200 flex items-center gap-4 text-sm ${
                  currentTrackIndex === index
                    ? "bg-[#a3fff4]/20 text-[#a3fff4]"
                    : "hover:bg-white/10"
                }`}
              >
                <span className="font-mono text-white/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{track.title}</span>
                {currentTrackIndex === index && isPlaying && !isLoading && (
                  <Pause size={16} className="mr-auto text-[#a3fff4]/70" />
                )}
                {currentTrackIndex === index && !isPlaying && !isLoading && (
                  <Play size={16} className="mr-auto text-[#a3fff4]/70" />
                )}
                {currentTrackIndex === index && isLoading && (
                  <Loader
                    size={16}
                    className="mr-auto text-[#a3fff4]/70 animate-spin"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
