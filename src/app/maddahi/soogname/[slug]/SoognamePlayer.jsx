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

const DownloadButton = ({ audioSrc, title }) => {
  const [downloadState, setDownloadState] = useState("idle");

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
      setTimeout(() => setDownloadState("idle"), 2000);
    }
  };

  const renderIcon = () => {
    switch (downloadState) {
      case "loading":
        return <Loader size={18} className="animate-spin" />;
      case "success":
        return <CheckCircle size={18} className="text-[var(--success)]" />;
      case "error":
        return <AlertTriangle size={18} className="text-[var(--error)]" />;
      default:
        return <Download size={18} />;
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloadState === "loading"}
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

export default function SoognamePlayer({ playlist, artistName, mainImage }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoopingOne, setIsLoopingOne] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.link;
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
    if ("mediaSession" in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: artistName || "به سوی تو",
        album: "مجموعه سوگنامه",
        artwork: [
          {
            src: mainImage || "/favicon.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
      });
      navigator.mediaSession.setActionHandler("play", handlePlayPause);
      navigator.mediaSession.setActionHandler("pause", handlePlayPause);
      navigator.mediaSession.setActionHandler("previoustrack", handlePrev);
      navigator.mediaSession.setActionHandler("nexttrack", handleNext);
    }
  }, [currentTrackIndex, currentTrack]);

  useEffect(() => {
    if ("mediaSession" in navigator)
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  };

  const handleNext = () =>
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  const handlePrev = () =>
    setCurrentTrackIndex(
      (prev) => (prev - 1 + playlist.length) % playlist.length,
    );
  const handleEnded = () =>
    isLoopingOne
      ? ((audioRef.current.currentTime = 0), audioRef.current.play())
      : handleNext();

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    if (progressBarRef.current && audioRef.current.duration) {
      progressBarRef.current.style.setProperty(
        "--progress",
        `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%`,
      );
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || time <= 0) return "00:00";
    const min = Math.floor(time / 60),
      sec = Math.floor(time % 60);
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (!playlist || playlist.length === 0) return null;

  return (
    <div
      style={{ direction: "rtl" }}
      className="w-full bg-[var(--background-secondary)]/70 backdrop-blur-xl text-[var(--foreground-primary)] overflow-hidden sm:rounded-2xl ring-1 ring-black/20"
    >
      <audio
        ref={audioRef}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onCanPlay={() => setIsLoading(false)}
      />
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-grow min-w-0">
            <h3 className="font-bold text-base sm:text-lg truncate">
              {currentTrack.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <DownloadButton
              audioSrc={currentTrack.link}
              title={currentTrack.title}
            />
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
            className="music-progress-container relative h-1.5 w-full bg-[var(--background-tertiary)] rounded-full cursor-pointer group"
            onClick={(e) => {
              if (!duration) return;
              audioRef.current.currentTime =
                (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) *
                duration;
            }}
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
          <button
            onClick={handlePrev}
            className="p-3 rounded-full transition-colors duration-300 hover:bg-[var(--background-tertiary)]"
          >
            <SkipBack fill="currentColor" size={22} />
          </button>
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 flex items-center justify-center bg-[var(--accent-crystal-highlight)] text-black rounded-full shadow-lg transition-transform hover:scale-105"
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
            onClick={handleNext}
            className="p-3 rounded-full transition-colors duration-300 hover:bg-[var(--background-tertiary)]"
          >
            <SkipForward fill="currentColor" size={22} />
          </button>
        </div>
      </div>
      <div className="bg-black/30 p-2 max-h-60 overflow-y-auto">
        <ul className="space-y-1">
          {playlist.map((track, index) => (
            <li key={track.ID}>
              <button
                onClick={() => setCurrentTrackIndex(index)}
                className={`w-full text-right p-3 rounded-lg transition-colors duration-200 flex items-center gap-4 text-sm ${currentTrackIndex === index ? "bg-[var(--accent-crystal-highlight)]/20 text-[var(--accent-crystal-highlight)]" : "hover:bg-[var(--background-tertiary)]"}`}
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
