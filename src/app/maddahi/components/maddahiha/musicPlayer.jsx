"use client";
import { useState, useEffect, useRef, memo, useCallback } from "react";
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

  const handleIcon = useCallback(() => {
    if (!audioRef.current) return;
    if (!audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [setIsPlaying]);

<<<<<<< Updated upstream
  const handlePlay = useCallback((musicUrl) => {
    if (!audioRef.current) return;
    if (musicUrl === audioRef.current.src) {
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
  }, [first, handleIcon, setIsPlaying]);
=======
  const handlePlay = useCallback(
    (musicUrl) => {
      if (!audioRef.current) return;
      if (musicUrl === audioRef.current.src) {
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
    },
    [first, handleIcon, setIsPlaying],
  );
>>>>>>> Stashed changes

  const forward = useCallback(() => {
    if (index + 1 < posts.length) {
      const i = index + 1;
      setIndex(i);
      handlePlay(posts[i].link);
      setPID(posts[i].ID);
    } else {
      setIndex(0);
      control.current.index = 0;
      if (totalPages === 1) {
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
<<<<<<< Updated upstream
  }, [index, posts, totalPages, page, setPage, setIndex, setPID, set, handlePlay]);
=======
  }, [
    index,
    posts,
    totalPages,
    page,
    setPage,
    setIndex,
    setPID,
    set,
    handlePlay,
  ]);
>>>>>>> Stashed changes

  const backward = useCallback(() => {
    if (index - 1 >= 0) {
      const i = index - 1;
      setIndex(i);
      handlePlay(posts[i].link);
      setPID(posts[i].ID);
    } else {
      if (page === 1) return;
      control.current.index = 1;
      control.current.n = 1;
      control.current.page = page - 1;
      setPage(control.current.page);
      set(3);
    }
  }, [index, posts, page, setPage, setIndex, setPID, set, handlePlay]);

  useEffect(() => {
    if (handle === "0") return;
    handlePlay(handle);
    setHandle("0");
  }, [handle, handlePlay, setHandle]);

  useEffect(() => {
    const currentPost = posts[index];
    if ("mediaSession" in navigator && currentPost) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentPost.title,
        artist: currentPost.cat?.[0]?.name || "به سوی تو",
<<<<<<< Updated upstream
        artwork: [{ src: currentPost.thumbnail || "/favicon.webp", sizes: "512x512", type: "image/webp" }]
=======
        artwork: [
          {
            src: currentPost.thumbnail || "/favicon.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
>>>>>>> Stashed changes
      });
      navigator.mediaSession.setActionHandler("play", handleIcon);
      navigator.mediaSession.setActionHandler("pause", handleIcon);
      navigator.mediaSession.setActionHandler("previoustrack", backward);
      navigator.mediaSession.setActionHandler("nexttrack", forward);
    }
  }, [index, posts, handleIcon, backward, forward]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlay ? "playing" : "paused";
    }
  }, [isPlay]);

  const handledownload = () => {
    if (!audioRef.current?.src || index === -1) return;
    const title = posts[index]?.title || "nava";
    const cleanTitle = title.replace(/[/\\?%*:|"<>]/g, "-");
    const filename = `${cleanTitle}.mp3`;
    const audioUrl = audioRef.current.src;
    const downloadUrl = `/maddahi/api/dl/${encodeURIComponent(filename)}?url=${encodeURIComponent(audioUrl)}`;
<<<<<<< Updated upstream
    
=======

>>>>>>> Stashed changes
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = downloadUrl;
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const secondsLeft = Math.floor(time % 60);
    return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
  };

  return (
    <div>
      <audio
        ref={audioRef}
        loop={musicPlayer.refresh}
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => {
          setLoading(false);
<<<<<<< Updated upstream
          setMusicPlayer((p) => ({ ...p, duration: audioRef.current.duration }));
=======
          setMusicPlayer((p) => ({
            ...p,
            duration: audioRef.current.duration,
          }));
>>>>>>> Stashed changes
          if (timeLine.current) {
            timeLine.current.min = 0;
            timeLine.current.max = 10000;
          }
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }}
        onError={() => audioRef.current.load()}
        onTimeUpdate={() => {
          setMusicPlayer((p) => ({
            ...p,
            currentTime: audioRef.current.currentTime,
          }));
          if (timeLine.current && audioRef.current) {
<<<<<<< Updated upstream
            const val = (audioRef.current.currentTime / musicPlayer.duration) * 10000;
            timeLine.current.value = val || 0;
            const pct = (audioRef.current.currentTime / musicPlayer.duration) * 100;
=======
            const val =
              (audioRef.current.currentTime / musicPlayer.duration) * 10000;
            timeLine.current.value = val || 0;
            const pct =
              (audioRef.current.currentTime / musicPlayer.duration) * 100;
>>>>>>> Stashed changes
            timeLine.current.style.background = `linear-gradient(to right, var(--accent-primary) ${pct}%, var(--background-tertiary) ${pct}%)`;
          }
        }}
        onEnded={forward}
        style={{ display: "none" }}
      />
<<<<<<< Updated upstream
      <div className={`fixed bottom-0 left-0 right-0 h-[110px] bg-[var(--background-primary)/80] backdrop-blur-lg shadow-2xl transition-transform duration-500 ease-in-out z-1000 ${first ? "translate-y-full" : "translate-y-0"}`}>
=======
      <div
        className={`fixed bottom-0 left-0 right-0 h-[110px] bg-[var(--background-primary)/80] backdrop-blur-lg shadow-2xl transition-transform duration-500 ease-in-out z-1000 ${first ? "translate-y-full" : "translate-y-0"}`}
      >
>>>>>>> Stashed changes
        <div className="relative w-full px-4 main-music">
          <input
            ref={timeLine}
            onChange={() => {
              if (audioRef.current && timeLine.current) {
<<<<<<< Updated upstream
                audioRef.current.currentTime = (timeLine.current.value / 10000) * musicPlayer.duration;
=======
                audioRef.current.currentTime =
                  (timeLine.current.value / 10000) * musicPlayer.duration;
>>>>>>> Stashed changes
              }
            }}
            type="range"
            className="w-full"
          />
          <div className="flex justify-between text-xs font-mono text-[var(--foreground-muted)] px-1 mt-1">
            <span>{formatTime(musicPlayer.duration)}</span>
            <span>{formatTime(musicPlayer.currentTime)}</span>
          </div>
        </div>
        <div className="flex justify-center items-center gap-8 mt-[-10px]">
<<<<<<< Updated upstream
          <Download onClick={handledownload} className="cursor-pointer text-[var(--foreground-muted)] transition-all duration-300 ease-in-out hover:text-[var(--foreground-primary)] hover:scale-110 active:scale-95" size={24} />
          <SkipForward onClick={backward} className="cursor-pointer text-[var(--foreground-secondary)] transition-all duration-300 ease-in-out hover:text-[var(--foreground-primary)] hover:scale-110 active:scale-95" size={30} fill="currentColor" />
          <button onClick={handleIcon} className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)/40] transition-all duration-300 ease-in-out hover:scale-105 hover:opacity-90 active:scale-95">
            {isPlay ? (
              <Pause size={32} fill="currentColor" className="text-[var(--background-primary)]" />
            ) : (
              <Play size={32} fill="currentColor" className="text-[var(--background-primary)] ml-1" />
            )}
          </button>
          <SkipBack onClick={forward} className="cursor-pointer text-[var(--foreground-secondary)] transition-all duration-300 ease-in-out hover:text-[var(--foreground-primary)] hover:scale-110 active:scale-95" size={30} fill="currentColor" />
          <Repeat onClick={() => setMusicPlayer((p) => ({ ...p, refresh: !p.refresh }))} className={`cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 ${musicPlayer.refresh ? "text-[var(--accent-primary)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground-primary)]"}`} size={24} />
=======
          <Download
            onClick={handledownload}
            className="cursor-pointer text-[var(--foreground-muted)] transition-all duration-300 ease-in-out hover:text-[var(--foreground-primary)] hover:scale-110 active:scale-95"
            size={24}
          />
          <SkipForward
            onClick={backward}
            className="cursor-pointer text-[var(--foreground-secondary)] transition-all duration-300 ease-in-out hover:text-[var(--foreground-primary)] hover:scale-110 active:scale-95"
            size={30}
            fill="currentColor"
          />
          <button
            onClick={handleIcon}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)/40] transition-all duration-300 ease-in-out hover:scale-105 hover:opacity-90 active:scale-95"
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
          <SkipBack
            onClick={forward}
            className="cursor-pointer text-[var(--foreground-secondary)] transition-all duration-300 ease-in-out hover:text-[var(--foreground-primary)] hover:scale-110 active:scale-95"
            size={30}
            fill="currentColor"
          />
          <Repeat
            onClick={() =>
              setMusicPlayer((p) => ({ ...p, refresh: !p.refresh }))
            }
            className={`cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 ${musicPlayer.refresh ? "text-[var(--accent-primary)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground-primary)]"}`}
            size={24}
          />
>>>>>>> Stashed changes
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-50">
          <div className="w-12 h-12 border-4 border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
<<<<<<< Updated upstream
export default memo(MusicPlayer);
=======
export default memo(MusicPlayer);
>>>>>>> Stashed changes
