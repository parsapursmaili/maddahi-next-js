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

const MusicPlayer = ({ audioSrc, title, artist, image }) => {
  const audioRef = useRef(null);
  const timeLineRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [n, setn] = useState(0);
  const [h, seth] = useState(0);
  const [downloadState, setDownloadState] = useState("idle");

  useEffect(() => {
    if ("mediaSession" in navigator && audioSrc) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || "نوا",
        artist: artist || "به سوی تو",
        album: "مداحی و نماهنگ",
        artwork: [
          {
            src: image || "/favicon.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () =>
        audioRef.current?.play(),
      );
      navigator.mediaSession.setActionHandler("pause", () =>
        audioRef.current?.pause(),
      );
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const skipTime = details.seekOffset || 10;
        audioRef.current.currentTime = Math.max(
          audioRef.current.currentTime - skipTime,
          0,
        );
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const skipTime = details.seekOffset || 10;
        audioRef.current.currentTime = Math.min(
          audioRef.current.currentTime + skipTime,
          audioRef.current.duration,
        );
      });
    }
  }, [audioSrc, title, artist, image]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  const handleprogress = () => {
    if (!duration) return;
    const percent =
      ((audioRef.current.currentTime / duration) * 100).toFixed(4) + "%";
    timeLineRef.current.style.setProperty("--progress", percent);
  };

  const canplay = () => {
    setDuration(audioRef.current.duration);
    if (!h) return;
    setn(1);
    audioRef.current.play();
  };

  const handlePlayPause = () => {
    if (!n) {
      seth(1);
      audioRef.current.load();
      return;
    }
    if (!audioRef.current.paused) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
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

  const handleDownload = () => {
    if (!audioSrc || downloadState === "loading") return;
    setDownloadState("loading");
    try {
      const cleanTitle = (title || "nava").replace(/[/\\?%*:|"<>]/g, "-");
      const filename = `${cleanTitle}.mp3`;
      const secureUrl = audioSrc.replace(/^http:\/\//i, "https://");
      const downloadUrl = `/maddahi/api/dl/${encodeURIComponent(filename)}?url=${encodeURIComponent(secureUrl)}`;

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = downloadUrl;
      document.body.appendChild(iframe);
      setTimeout(() => {
        document.body.removeChild(iframe);
        setDownloadState("success");
      }, 1000);
    } catch (error) {
      setDownloadState("error");
    } finally {
      setTimeout(() => setDownloadState("idle"), 3000);
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
      <button
        className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 cursor-pointer rounded-full bg-[var(--accent-primary)] text-[var(--background-primary)] transition-all duration-300 ease-in-out hover:opacity-90 hover:scale-105 shadow-md"
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause size={22} fill="currentColor" />
        ) : (
          <Play size={22} fill="currentColor" className="ml-1" />
        )}
      </button>

      <span className="font-mono text-xs sm:text-sm text-[var(--foreground-muted)] w-12 text-center">
        {formatTime(currentTime)}
      </span>

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

      <span className="font-mono text-xs sm:text-sm text-[var(--foreground-muted)] w-12 text-center">
        {formatTime(duration)}
      </span>

      <button
        className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 cursor-pointer rounded-full bg-[var(--background-tertiary)]/60 text-[var(--foreground-secondary)] transition-all duration-300 ease-in-out hover:bg-[var(--border-secondary)] hover:text-[var(--foreground-primary)] disabled:opacity-60 disabled:cursor-wait"
        onClick={handleDownload}
        disabled={downloadState === "loading"}
      >
        <DownloadIcon />
      </button>

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onCanPlay={canplay}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }}
      ></audio>
    </div>
  );
};

export default MusicPlayer;
