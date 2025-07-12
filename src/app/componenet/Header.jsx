"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const searchInputRef = useRef(null);

  // منطق برای افکت نورپردازی موس با انیمیشن فنری نرم‌تر
  const mouseX = useMotionValue(Infinity);
  const springMouseX = useSpring(mouseX, { stiffness: 200, damping: 30 }); // تنظیمات فنری نرم‌تر

  const navLinks = [
    { href: "/home", label: "صفحه اصلی" },
    { href: "/view", label: "آخرین‌ها" },
    { href: "/9740", label: "محبوب‌ترین‌ها" },
    { href: "/about", label: "درباره ما" }, // یک لینک جدید برای تکمیل
  ];

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    // بستن منوی موبایل در صورت تغییر مسیر
    setIsMenuOpen(false);
  }, [isSearchOpen, pathname]); // اضافه کردن pathname به لیست وابستگی‌ها

  return (
    <>
      <motion.header
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] backdrop-blur-xl border-b border-[#2a2a2a] overflow-x-hidden shadow-2xl"
      >
        {/* افکت نور دنبال‌کننده موس - بزرگ‌تر و با جلوه هاله */}
        <motion.div
          style={{
            left: springMouseX,
          }}
          className="pointer-events-none absolute inset-0 z-[-1] -translate-x-1/2 transition-transform duration-500"
        >
          <div className="absolute inset-0 h-full w-full bg-[radial-gradient(500px_circle_at_center,rgba(0,255,255,0.08),transparent_75%)] opacity-80"></div>
        </motion.div>

        <div className="relative container mx-auto flex items-center justify-between p-4 h-20 text-white">
          {/* لوگو با افکت نئونی پیشرفته‌تر و درخشش متحرک */}
          <Link
            href="/"
            className="text-3xl lg:text-4xl font-black text-white transition-all duration-500 ease-in-out relative group"
          >
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
              به سوی تو
            </span>
            {/* جلوه درخشش پس‌زمینه */}
            <motion.span
              className="absolute inset-0 block rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(0,255,255,0.4) 0%, transparent 70%)",
                scale: 1.2,
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
                repeatType: "reverse",
              }}
            />
          </Link>

          {/* منوی دسکتاپ با هاور درخشان و فعال‌سازی متحرک */}
          <nav className="hidden md:flex items-center">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <motion.li
                    key={link.href}
                    className="relative rounded-lg transition-colors"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(0,255,255,0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Link
                      href={link.href}
                      className={`group relative block px-5 py-2 font-medium text-base rounded-lg overflow-hidden transition-all duration-300 ${
                        isActive
                          ? "text-cyan-300 bg-white/5 shadow-inner"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <span className="relative z-10">{link.label}</span>
                      {/* پس زمینه هاور با گرادیان و انیمیشن */}
                      <motion.div className="absolute inset-0 z-0 rounded-lg bg-gradient-to-r from-blue-600/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></motion.div>
                      {/* خط زیرین برای لینک فعال */}
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                          layoutId="underline"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                        />
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* آیکون و باکس جستجوی انیمیشنی پیشرفته‌تر */}
          <div className="hidden md:flex items-center justify-end w-56">
            <AnimatePresence mode="wait" initial={false}>
              {isSearchOpen ? (
                <motion.div
                  key="search-input"
                  initial={{ width: 0, opacity: 0, scaleX: 0 }}
                  animate={{ width: "100%", opacity: 1, scaleX: 1 }}
                  exit={{ width: 0, opacity: 0, scaleX: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative origin-right"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    onBlur={() => setIsSearchOpen(false)}
                    placeholder="جستجو..."
                    className="w-full bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-full py-2 pr-4 pl-10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/60 shadow-lg transition-all duration-300"
                  />
                  <FaSearch className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" />
                </motion.div>
              ) : (
                <motion.button
                  key="search-button"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                  onClick={() => setIsSearchOpen(true)}
                  className="p-3 text-xl text-gray-300 hover:text-cyan-300 hover:bg-white/10 rounded-full transition-all duration-300 shadow-md transform hover:scale-110"
                  aria-label="باز کردن جستجو"
                >
                  <FaSearch />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* دکمه منوی موبایل */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white text-2xl p-2 z-50 relative hover:text-cyan-300 transition-colors transform hover:scale-110"
              aria-label="منو"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="times"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaTimes />
                  </motion.div>
                ) : (
                  <motion.div
                    key="bars"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaBars />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* منوی موبایل تمام‌صفحه با انیمیشن‌های لایه‌ای و پس‌زمینه درخشان */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: "circOut" }}
            className="fixed inset-0 z-40 bg-black/80 md:hidden flex flex-col items-center justify-center p-8"
            onClick={() => setIsMenuOpen(false)}
          >
            {/* جلوه نور پس‌زمینه */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.05),transparent_70%)] animate-pulse-slow"
            ></motion.div>

            <motion.nav
              initial={{ y: "-100%", opacity: 0, scale: 0.9 }}
              animate={{ y: "0%", opacity: 1, scale: 1 }}
              exit={{ y: "-100%", opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-lg shadow-2xl pt-12 pb-8 flex flex-col items-center gap-6 border border-[#2a2a2a]"
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -30, x: -10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    x: 0,
                    transition: {
                      delay: 0.2 + i * 0.08,
                      duration: 0.4,
                      ease: "easeOut",
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: -30,
                    x: -10,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-4xl font-extrabold text-gray-200 hover:text-cyan-400 transition-all duration-300 drop-shadow-xl relative overflow-hidden"
                  >
                    {link.label}
                    {/* جلوه خط زیرین روی هاور */}
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
