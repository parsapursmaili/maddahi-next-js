"use client";
import { useState, useEffect, useRef, memo } from "react";
// وارد کردن آیکون‌های مورد نیاز از lucide-react
import {
  Download,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
} from "lucide-react";

const MusicPlayer = ({
  posts,
  index,
  setIndex,
  page,
  setPage,
  totalPages,
  handle,
  control,
  setHandle,
  isPlay,
  setIsPlaying,
  setPID,
  set,
}) => {
  const [musicPlayer, setMusicPlayer] = useState({
    duration: 0,
    currentTime: 0,
    refresh: false,
  });
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(true);
  const audioRef = useRef(null);
  const timeLine = useRef(null);

  useEffect(() => {
    if (handle == "0") return;
    handlePlay(handle);
    setHandle("0");
  }, [handle]);

  const handlePlay = (musicUrl) => {
    if (musicUrl == audioRef.current.src) {
      handleIcon();
      return;
    }
    setLoading(false);
    if (!audioRef.current.paused) {
      audioRef.current.pause();
      setMusicPlayer((p) => ({ ...p, currentTime: 0 }));
      setIsPlaying(false);
    }
    if (first) setFirst(false);
    if (musicUrl) {
      audioRef.current.src = musicUrl;
      audioRef.current.load();
      setLoading(true);
    }
  };

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const secondsLeft = Math.floor(time % 60);
    return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
  }

  function setTimeLine() {
    const val = (audioRef.current.currentTime / musicPlayer.duration) * 10000;
    timeLine.current.value = val;
    updateProgressBar();
  }

  function updateProgressBar() {
    if (!musicPlayer.duration) return;
    const val = (audioRef.current.currentTime / musicPlayer.duration) * 100;
    timeLine.current.style.background = `linear-gradient(to right, var(--accent-primary) ${val}%, var(--background-tertiary) ${val}%)`;
  }
  function canPlay() {
    setLoading(false);
    setMusicPlayer((p) => ({ ...p, duration: audioRef.current.duration }));
    timeLine.current.min = 0;
    timeLine.current.max = 10000;
    audioRef.current.play();
    setIsPlaying(true);
  }
  function handleIcon() {
    if (!audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }
  function handledownload() {
    const link = document.createElement("a");
    link.href = audioRef.current.src;
    link.download = true;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  function forward() {
    if (index + 1 < posts.length) {
      const i = index + 1;
      setIndex(index + 1);
      handlePlay(posts[i].link);
      setPID(posts[i].ID);
    } else {
      setIndex(0);
      control.current.index = 0;
      if (totalPages == 1) {
        handlePlay(posts[0].link);
        setPID(posts[0].ID);
        return;
      }
      control.current.n = 1;
      control.current.page = page + 1 > totalPages ? 1 : page + 1;
      setPage(control.current.page);
      set(3);
      handlePlay(posts[0].link);
    }
  }
  function backward() {
    if (index - 1 >= 0) {
      const i = index - 1;
      setIndex(index - 1);
      handlePlay(posts[i].link);
      setPID(posts[i].ID);
    } else {
      if (page == 1) return;
      control.current.index = 1;
      control.current.n = 1;
      control.current.page = page - 1;
      setPage(control.current.page);
      set(3);
    }
  }
  return (
    <div>
      <audio
        ref={audioRef}
        loop={musicPlayer.refresh}
        onLoadStart={() => setLoading(true)}
        onCanPlay={canPlay}
        onError={() => audioRef.current.load()}
        onTimeUpdate={() => {
          setMusicPlayer((p) => ({
            ...p,
            currentTime: audioRef.current.currentTime,
          }));
          setTimeLine();
        }}
        onEnded={forward}
        style={{ display: "none" }}
      />
      {/* پلیر اصلی */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-[110px] bg-[var(--background-primary)/80] backdrop-blur-lg shadow-2xl transition-transform duration-500 ease-in-out z-1000 ${
          first ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="relative w-full px-4 main-music ">
          <input
            ref={timeLine}
            onChange={() => {
              audioRef.current.currentTime =
                (timeLine.current.value / 10000) * musicPlayer.duration;
              updateProgressBar();
            }}
            type="range"
            className="w-full "
          />
          <div className=" flex justify-between text-xs font-mono text-[var(--foreground-muted)] px-1 mt-1">
            <span>{formatTime(musicPlayer.duration)}</span>
            <span>{formatTime(musicPlayer.currentTime)}</span>
          </div>
        </div>

        {/* دکمه‌های کنترل با آیکون‌های lucide-react */}
        <div className="flex justify-center items-center gap-8 mt-[-10px]">
          {/* دکمه دانلود */}
          <Download
            onClick={handledownload}
            className="cursor-pointer text-[var(--foreground-muted)] transition-all duration-300 ease-in-out hover:text-[var(--foreground-primary)] hover:scale-110 active:scale-95"
            size={24}
            title="دانلود"
          />

          {/* دکمه آهنگ قبلی */}
          <SkipForward
            onClick={backward}
            className="cursor-pointer text-[var(--foreground-secondary)] transition-all duration-300 ease-in-out hover:text-[var(--foreground-primary)] hover:scale-110 active:scale-95"
            size={30}
            fill="currentColor"
            title="آهنگ قبلی"
          />

          {/* دکمه اصلی پخش/توقف */}
          <button
            onClick={handleIcon}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)/40] transition-all duration-300 ease-in-out hover:scale-105 hover:opacity-90 active:scale-95"
            aria-label={isPlay ? "توقف" : "پخش"}
          >
            {isPlay ? (
              <Pause
                size={32}
                fill="currentColor"
                className="text-[var(--background-primary)]"
              />
            ) : (
              <Play
                size={32}
                fill="currentColor"
                className="text-[var(--background-primary)] ml-1"
              />
            )}
          </button>

          {/* دکمه آهنگ بعدی */}
          <SkipBack
            onClick={forward}
            className="cursor-pointer text-[var(--foreground-secondary)] transition-all duration-300 ease-in-out hover:text-[var(--foreground-primary)] hover:scale-110 active:scale-95"
            size={30}
            fill="currentColor"
            title="آهنگ بعدی"
          />

          {/* دکمه تکرار */}
          <Repeat
            onClick={() =>
              setMusicPlayer((p) => ({ ...p, refresh: !musicPlayer.refresh }))
            }
            className={`cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 ${
              musicPlayer.refresh
                ? "text-[var(--accent-primary)]"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground-primary)]"
            }`}
            size={24}
            title="تکرار"
          />
        </div>
      </div>

      {/* اسپینر لودینگ */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-50">
          <div className="w-12 h-12 border-4 border-[var(--background-tertiary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
export default memo(MusicPlayer);
