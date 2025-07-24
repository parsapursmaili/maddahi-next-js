"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

export default function NProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const progress = useMotionValue(0);
  const springProgress = useSpring(progress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeout;

    setIsVisible(true);
    progress.set(10);
    timeout = setTimeout(() => {
      progress.set(60);
    }, 300);

    return () => {
      clearTimeout(timeout);
      progress.set(100);
      setTimeout(() => {
        setIsVisible(false);
        progress.set(0);
      }, 500);
    };
  }, [pathname, searchParams, progress]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          style={{
            width: springProgress,
            scaleX: springProgress,
            transformOrigin: "left",
          }}
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: `${springProgress.get()}%` }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--success)] z-[9999] shadow-lg"
        />
      )}
    </AnimatePresence>
  );
}
