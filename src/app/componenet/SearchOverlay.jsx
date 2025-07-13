// components/SearchOverlay.js

"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

// انیمیشن‌های والد و فرزند برای ورود محتوا
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

  // فوکوس خودکار روی اینپوت
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // بستن مودال با دکمه Esc
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن مودال با کلیک روی محتوای داخلی
        className="relative w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.button
          onClick={onClose}
          className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors text-3xl"
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
            // استفاده از رنگ‌های پالت شما
            className="w-full bg-transparent border-b-2 border-slate-600 focus:border-sky-500 text-3xl md:text-5xl text-slate-200 placeholder:text-slate-400/70 focus:outline-none py-4 transition-colors duration-300"
          />
        </motion.div>

        <motion.p
          className="text-slate-400 text-sm mt-4 text-center"
          variants={itemVariants}
        >
          برای بستن کلید{" "}
          <kbd className="border border-slate-600 rounded-md px-2 py-1 text-xs">
            Esc
          </kbd>{" "}
          را فشار دهید
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
