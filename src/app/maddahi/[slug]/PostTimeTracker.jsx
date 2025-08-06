// /app/maddahi/componenet/PostTimeTracker.jsx (این فایل را ایجاد کنید)
"use client";

import { useEffect, useRef } from "react";

/**
 * کامپوننت کلاینت برای ردیابی زمان حضور کاربر در صفحه.
 * @param {{ postId: number | string }} props
 */
export default function PostTimeTracker({ postId }) {
  const startTimeRef = useRef(Date.now());
  const hasSentBeaconRef = useRef(false);

  useEffect(() => {
    if (!postId) return;

    const sendBeaconLogic = () => {
      if (hasSentBeaconRef.current) return;

      const endTime = Date.now();
      const seconds = (endTime - startTimeRef.current) / 1000;

      if (seconds > 5) {
        hasSentBeaconRef.current = true;
        const data = JSON.stringify({ postId, seconds: Math.round(seconds) });
        navigator.sendBeacon("/maddahi/api/log-time", data);
      }
    };

    window.addEventListener("unload", sendBeaconLogic);

    return () => {
      sendBeaconLogic();
      window.removeEventListener("unload", sendBeaconLogic);
    };
  }, [postId]);

  return null;
}
