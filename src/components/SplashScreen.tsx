"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Hide the splash screen after 3 seconds for a luxurious feel
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname]);

  // To prevent scrolling while splash screen is active
  useEffect(() => {
    if (isVisible && pathname === "/") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isVisible, pathname]);

  if (pathname !== "/") return null;

  return (
    <AnimatePresence>
      {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F9FAFB] text-zinc-900 overflow-hidden"
          >
          {/* Subtle background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1.2 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="w-[50vw] h-[50vw] bg-blue-100/40 rounded-full blur-[120px]"
            />
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center space-y-12 relative z-10"
          >
            {/* Elegant Logo Animation */}
            <motion.div
              initial={{ filter: "drop-shadow(0px 0px 0px rgba(0,0,0,0))", scale: 0.9 }}
              animate={{ filter: "drop-shadow(0px 15px 40px rgba(37, 99, 235, 0.15))", scale: 1 }}
              transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
              className="relative w-56 h-36 md:w-72 md:h-48"
            >
              <Image 
                src="/images/logo-2.png" 
                alt="Premium Logo" 
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
                transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl md:text-3xl font-extrabold tracking-[0.15em] uppercase text-zinc-800 drop-shadow-sm"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                ELEVATING REAL ESTATE
              </motion.h1>
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 1.1, duration: 1, ease: "easeInOut" }}
                className="h-px bg-gradient-to-r from-transparent via-blue-900/20 to-transparent mt-4 mb-4"
              />
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
                className="text-blue-600/80 font-bold tracking-[0.2em] text-xs md:text-sm uppercase"
              >
                New Zealand's Most Trusted Network
              </motion.p>
            </div>
            
            {/* Minimalist Progress Indicator */}
            <motion.div 
              className="w-40 h-[3px] mt-12 bg-zinc-200/60 rounded-full overflow-hidden shadow-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 rounded-full"
                initial={{ width: "0%", x: "-100%" }}
                animate={{ width: "100%", x: "0%" }}
                transition={{ duration: 1.8, ease: "easeInOut", delay: 1.6 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
