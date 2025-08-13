// /app/maddahi/soogname/[slug]/SoognamePlayer.jsx
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

// ★★★ کامپوننت دکمه دانلود با رنگ‌های اصلاح شده ★★★
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
        // اصلاح رنگ با متغیر CSS
        return <CheckCircle size={18} className="text-[var(--success)]" />;
      case "error":
        // اصلاح رنگ با متغیر CSS
        return <AlertTriangle size={18} className="text-[var(--error)]" />;
      default:
        return <Download size={18} />;
    }
  };
  return (
    <button
      onClick={handleDownload}
      disabled={downloadState === "loading"}
      // اصلاح رنگ هاور با متغیر CSS
      className="p-2 rounded-full transition-colors duration-300 hover:bg-[var(--background-tertiary)] disabled:opacity-50"
    >
      {renderIcon()}
    </button>
  );
};

const AudioWaveLoader = () => (
  <div className="flex items-center justify-center h-full w-full gap-1">
    <style jsx>{`
      .wave-bar {
        /* اصلاح رنگ با متغیر CSS */
        background-color: var(--background-primary);
        width: 4px;
        height: 24px;
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
  const [isLoading, setIsLoading] = useState(false); // مقدار اولیه false باقی می‌ماند

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    // ★★★ اصلاح اصلی: حذف setIsLoading(true) از اینجا ★★★
    // با این تغییر، لودینگ اولیه فقط در پشت صحنه انجام شده و UI لودر را نشان نمی‌دهد
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.link;
      audioRef.current.load(); // به مرورگر می‌گوییم فایل جدید را آماده کند
      if (isPlaying) {
        // اگر در حال پخش بودیم، ترک جدید را هم پخش کن
        audioRef.current
          .play()
          .catch((e) => console.error("Error playing audio:", e));
      }
    }
  }, [currentTrackIndex, currentTrack]); // isPlaying از وابستگی‌ها حذف شد چون باعث رفتارهای ناخواسته می‌شد

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // ★★★ اصلاح اصلی: لودر فقط در صورتی نمایش داده می‌شود که کاربر پلی را بزند و فایل آماده نباشد ★★★
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
      <div className="text-center text-[var(--foreground-muted)] bg-[var(--background-secondary)] p-8 rounded-lg">
        فایل صوتی برای این سوگنامه یافت نشد.
      </div>
    );
  }

  return (
    // ★★★ اصلاح رنگ‌های اصلی پلیر با متغیرهای CSS ★★★
    <div
      style={{ direction: "rtl" }}
      className="w-full bg-[var(--background-secondary)]/70 backdrop-blur-xl text-[var(--foreground-primary)] overflow-hidden sm:rounded-2xl ring-1 ring-black/20"
    >
      <audio
        ref={audioRef}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata" // این گزینه باعث می‌شود مرورگر متادیتای صدا (مثل طول) را لود کند
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
              className="p-2 rounded-full transition-colors duration-300 hover:bg-[var(--background-tertiary)]"
            >
              {isLoopingOne ? (
                <Repeat1
                  size={18}
                  className="text-[var(--accent-crystal-highlight)]"
                />
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
            // اصلاح رنگ پراگرس بار با متغیرهای CSS
            className="music-progress-container relative h-1.5 w-full bg-[var(--background-tertiary)] rounded-full cursor-pointer group"
            onClick={handleProgressSeek}
          >
            <div
              className="music-progress-bar absolute h-full bg-[var(--accent-crystal-highlight)] rounded-full group-hover:bg-[var(--accent-primary)] transition-all"
              style={{ width: `var(--progress, 0%)` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-[var(--foreground-muted)] mt-1.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3">
          {/* منطق این دکمه‌ها صحیح است و دست نخورده باقی می‌ماند */}
          <button
            onClick={handleNext}
            className="p-3 rounded-full transition-colors duration-300 hover:bg-[var(--background-tertiary)] disabled:opacity-50"
            disabled={isLoading}
          >
            <SkipBack fill="currentColor" size={22} />
          </button>

          <button
            onClick={handlePlayPause}
            // اصلاح رنگ دکمه پلی و شادو با متغیرهای CSS
            className="w-16 h-16 flex items-center justify-center bg-[var(--accent-crystal-highlight)] text-black rounded-full shadow-lg shadow-[var(--accent-crystal-highlight)]/30 transition-transform hover:scale-105"
          >
            {isLoading ? (
              <AudioWaveLoader />
            ) : isPlaying ? (
              <Pause fill="currentColor" size={30} />
            ) : (
              <Play fill="currentColor" size={30} className="ml-1" />
            )}
          </button>

          <button
            onClick={handlePrev}
            className="p-3 rounded-full transition-colors duration-300 hover:bg-[var(--background-tertiary)] disabled:opacity-50"
            disabled={isLoading}
          >
            <SkipForward fill="currentColor" size={22} />
          </button>
        </div>
      </div>

      {/* ★★★ اصلاح رنگ لیست پخش با متغیرهای CSS ★★★ */}
      <div className="bg-black/30 p-2 max-h-60 overflow-y-auto">
        <ul className="space-y-1">
          {playlist.map((track, index) => (
            <li key={track.ID}>
              <button
                onClick={() => setCurrentTrackIndex(index)}
                className={`w-full text-right p-3 rounded-lg transition-colors duration-200 flex items-center gap-4 text-sm ${
                  currentTrackIndex === index
                    ? "bg-[var(--accent-crystal-highlight)]/20 text-[var(--accent-crystal-highlight)]"
                    : "hover:bg-[var(--background-tertiary)]"
                }`}
              >
                <span className="font-mono text-[var(--foreground-muted)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate flex-1">{track.title}</span>
                {currentTrackIndex === index && isPlaying && !isLoading && (
                  <Pause
                    size={16}
                    className="mr-auto text-[var(--accent-crystal-highlight)]/70 flex-shrink-0"
                  />
                )}
                {currentTrackIndex === index && !isPlaying && !isLoading && (
                  <Play
                    size={16}
                    className="mr-auto text-[var(--accent-crystal-highlight)]/70 flex-shrink-0"
                  />
                )}
                {currentTrackIndex === index && isLoading && (
                  <Loader
                    size={16}
                    className="mr-auto text-[var(--accent-crystal-highlight)]/70 animate-spin flex-shrink-0"
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
