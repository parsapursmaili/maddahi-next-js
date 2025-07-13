// components/Header.js

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import SearchOverlay from "./SearchOverlay";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  const mouseX = useMotionValue(Infinity);
  const springMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });

  const navLinks = [
    { href: "/home", label: "صفحه اصلی" },
    { href: "/view", label: "آخرین‌ها" },
    { href: "/9740", label: "محبوب‌ترین‌ها" },
    { href: "/about", label: "درباره ما" },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        // ✅ تغییر اصلی اینجاست: اضافه کردن کلاس overflow-x-hidden
        className="sticky top-0 z-40 w-full bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg overflow-x-hidden"
      >
        {/* افکت نورانی */}
        <motion.div
          style={{ left: springMouseX }}
          className="pointer-events-none absolute inset-0 z-[-1] -translate-x-1/2"
        >
          <div className="absolute inset-0 h-full w-full bg-[radial-gradient(400px_circle_at_center,rgba(29,78,216,0.15),transparent_80%)]"></div>
        </motion.div>

        <div className="container mx-auto flex items-center justify-between p-4 h-20 text-white">
          {/* لوگو */}
          <Link
            href="/"
            className="text-3xl lg:text-4xl font-black group transition-all duration-300"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-indigo-400 group-hover:from-white group-hover:to-sky-300">
              به سوی تو
            </span>
          </Link>

          {/* منوی دسکتاپ */}
          <nav className="hidden md:flex items-center">
            <ul className="flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <motion.li
                    key={link.href}
                    className="relative"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link
                      href={link.href}
                      className={`relative block px-4 py-2 font-medium text-base rounded-md transition-colors duration-300 ${
                        isActive
                          ? "text-slate-200"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-2 right-2 h-0.5 bg-sky-500"
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

          {/* آیکون‌ها در سمت چپ */}
          <div className="flex items-center gap-2">
            {/* دکمه جستجو */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-3 text-xl text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              aria-label="باز کردن جستجو"
            >
              <FaSearch />
            </button>

            {/* دکمه منوی موبایل */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white text-2xl p-2 z-50 relative"
                aria-label="منو"
              >
                <AnimatePresence initial={false} mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="times"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaTimes />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="bars"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaBars />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* رندر کردن منوی موبایل */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-slate-900/95 backdrop-blur-md md:hidden flex flex-col items-center justify-center p-8"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.nav className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.1 + i * 0.1 },
                  }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-3xl font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* رندر کردن مودال جستجو */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchOverlay onClose={() => setIsSearchOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
