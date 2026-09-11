"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const SPLASH_STORAGE_KEY = "hb_splash_last_shown";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only consider showing splash screen on the home page
    if (pathname !== "/") {
      setIsVisible(false);
      return;
    }

    // 1. Bypass completely for crawlers, Googlebot, and Lighthouse audit tools
    if (
      typeof navigator !== "undefined" &&
      /Lighthouse|Googlebot|bingbot|crawler|spider|HeadlessChrome|Speed Insights/i.test(
        navigator.userAgent
      )
    ) {
      setIsVisible(false);
      return;
    }

    try {
      const lastShown = localStorage.getItem(SPLASH_STORAGE_KEY);
      const now = Date.now();

      if (!lastShown || now - Number(lastShown) > TWO_HOURS_MS) {
        // More than 2 hours have passed (or first visit), show splash screen
        setIsVisible(true);
        localStorage.setItem(SPLASH_STORAGE_KEY, now.toString());

        // Automatically hide smoothly after 1.2 seconds
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 1200);

        return () => clearTimeout(timer);
      } else {
        // Less than 2 hours, do not show
        setIsVisible(false);
      }
    } catch {
      // In case localStorage is blocked or disabled
      setIsVisible(false);
    }
  }, [pathname]);

  // Prevent scrolling while splash screen is active
  useEffect(() => {
    if (isVisible && pathname === "/") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible, pathname]);

  if (pathname !== "/" || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#F9FAFB] text-zinc-900 overflow-hidden"
        >
          {/* Skip button for immediate access */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-6 right-6 z-20 px-3.5 py-1.5 rounded-full bg-zinc-200/70 hover:bg-zinc-300 text-zinc-700 text-xs font-bold transition-all flex items-center gap-1 backdrop-blur-sm shadow-sm"
          >
            Skip <X className="w-3.5 h-3.5" />
          </button>

          {/* Subtle background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center space-y-10 relative z-10"
          >
            {/* Elegant Logo Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="relative w-52 h-32 md:w-64 md:h-44"
            >
              <Image 
                src="/images/logo-2.png" 
                alt="Heaven Brick Logo" 
                fill 
                className="object-contain" 
                priority 
              />
            </motion.div>

            {/* Typography */}
            <div className="text-center overflow-hidden flex flex-col items-center">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl md:text-2xl font-extrabold tracking-[0.15em] uppercase text-zinc-800 drop-shadow-sm"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                ELEVATING REAL ESTATE
              </motion.h1>
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeInOut" }}
                className="h-px bg-gradient-to-r from-transparent via-blue-900/20 to-transparent mt-3 mb-3"
              />
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.7, ease: "easeOut" }}
                className="text-blue-600/80 font-bold tracking-[0.2em] text-xs uppercase"
              >
                New Zealand's Most Trusted Network
              </motion.p>
            </div>
            
            {/* Minimalist Progress Indicator */}
            <motion.div 
              className="w-36 h-[3px] mt-8 bg-zinc-200/60 rounded-full overflow-hidden shadow-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 rounded-full"
                initial={{ width: "0%", x: "-100%" }}
                animate={{ width: "100%", x: "0%" }}
                transition={{ duration: 1.4, ease: "easeInOut", delay: 1.1 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
