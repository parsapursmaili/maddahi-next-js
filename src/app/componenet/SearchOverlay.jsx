"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  exit: { y: 20, opacity: 0 },
};

export default function SearchOverlay({ onClose }) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--background-primary)/80] backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.button
          onClick={onClose}
          className="absolute -top-12 right-0 text-[var(--foreground-muted)] hover:text-[var(--foreground-primary)] transition-colors text-3xl"
          aria-label="بستن جستجو"
          variants={itemVariants}
        >
          <FaTimes />
        </motion.button>

        <motion.div variants={itemVariants}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="جستجو کنید..."
            className="w-full bg-transparent border-b-2 border-[var(--border-secondary)] focus:border-[var(--accent-primary)] text-3xl md:text-5xl text-[var(--foreground-primary)] placeholder:[var(--foreground-muted)]/70 focus:outline-none py-4 transition-colors duration-300"
          />
        </motion.div>

        <motion.p
          className="text-[var(--foreground-muted)] text-sm mt-4 text-center"
          variants={itemVariants}
        >
          برای بستن کلید{" "}
          <kbd className="border border-[var(--border-primary)] rounded-md px-2 py-1 text-xs">
            Esc
          </kbd>{" "}
          را فشار دهید
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
