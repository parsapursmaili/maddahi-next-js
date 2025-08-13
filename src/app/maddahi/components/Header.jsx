"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import SearchOverlay from "./SearchOverlay"; // فرض بر اینکه این کامپوننت وجود دارد

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/maddahi", label: "صفحه اصلی" },
    { href: "/maddahi/home", label: "مداحی ها" },
    { href: "/maddahi/contact-us", label: "تماس با ما" },
  ];

  // با تغییر مسیر، منو و جستجو را می‌بندیم
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--background-primary)/85] backdrop-blur-lg border-b border-[var(--border-primary)] shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.1)]">
        <div className="container mx-auto flex items-center justify-between p-4 h-20 text-[var(--foreground-primary)]">
          {/* لوگو با استایل جدید و انیمیشن درخشش */}
          <Link
            href="/maddahi/"
            className="text-3xl lg:text-4xl font-black relative overflow-hidden group"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-crystal-highlight)]">
              به سوی تو
            </span>
            {/* افکت درخشش هنگام هاور */}
            <span className="absolute inset-0 w-full h-full bg-[linear-gradient(100deg,transparent_20%,var(--accent-crystal-highlight),transparent_80%)] -translate-x-full transition-transform duration-700 ease-in-out group-hover:translate-x-full opacity-50 blur-xl" />
          </Link>

          {/* منوی دسکتاپ با استایل حبابی (Pill) */}
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
                    {/* --- تغییر در این قسمت اعمال شده است --- */}
                    <Link
                      href={link.href} // اصلاح شد: '/maddahi' اضافه حذف شد
                      className={`relative block px-4 py-2 text-base rounded-md transition-colors duration-300 z-10 ${
                        isActive
                          ? "text-[var(--foreground-primary)]"
                          : "text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)]"
                      }`}
                    >
                      {link.label}
                    </Link>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-[var(--background-tertiary)] rounded-lg z-0"
                        layoutId="active-pill"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                      />
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* آیکون‌ها در سمت چپ */}
          <div className="flex items-center gap-1">
            <motion.button
              onClick={() => setIsSearchOpen(true)}
              className="p-3 text-xl text-[var(--foreground-muted)] hover:text-[var(--foreground-primary)] rounded-full"
              aria-label="باز کردن جستجو"
              whileHover={{ backgroundColor: "var(--background-tertiary)" }}
              whileTap={{ scale: 0.9 }}
            >
              <FaSearch />
            </motion.button>

            <div className="md:hidden">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[var(--foreground-primary)] text-2xl p-3 z-50 relative rounded-full"
                aria-label="منو"
                whileTap={{ scale: 0.9 }}
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
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* منوی موبایل بهبود یافته */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-[var(--background-primary)/80] backdrop-blur-xl md:hidden flex flex-col items-center justify-center p-8"
          >
            <nav className="flex flex-col items-center gap-6">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.1 + i * 0.1 },
                    }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-3xl font-bold transition-colors ${
                        isActive
                          ? "text-[var(--accent-primary)]"
                          : "text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
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
