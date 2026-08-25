"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function CreditNagPopup() {
  const { wallet, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cycleCountRef = useRef(0);
  
  // Timing sequence: 1m (60s), 5m (300s), 7m (420s), then every 5m
  const getNextDelay = (cycle: number) => {
    if (cycle === 0) return 60 * 1000;
    if (cycle === 1) return 5 * 60 * 1000;
    if (cycle === 2) return 7 * 60 * 1000;
    return 5 * 60 * 1000;
  };

  // Close automatically if navigating to wallet
  useEffect(() => {
    if (pathname === '/dashboard/wallet' && isVisible) {
      setIsVisible(false);
    }
  }, [pathname, isVisible]);

  useEffect(() => {
    if (!wallet || !userData) return;
    
    // Stop completely if they have converted credits or have no credits
    if (wallet.lifetimeConverted > 0 || wallet.credits === 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsVisible(false);
      return;
    }
    
    const scheduleNext = () => {
      // Don't schedule if they've converted
      if (wallet.lifetimeConverted > 0 || wallet.credits === 0) return;
      
      const delay = getNextDelay(cycleCountRef.current);
      timerRef.current = setTimeout(() => {
        // Only pop up if not on wallet page
        if (window.location.pathname !== '/dashboard/wallet') {
          setIsVisible(true);
        }
        cycleCountRef.current += 1;
      }, delay);
    };

    // If timer is not running, start it
    if (!timerRef.current) {
      scheduleNext();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [wallet?.lifetimeConverted, wallet?.credits, userData]);

  const handleClose = () => {
    setIsVisible(false);
    
    // Schedule next immediately after closing manually
    if (timerRef.current) clearTimeout(timerRef.current);
    
    const delay = getNextDelay(cycleCountRef.current);
    timerRef.current = setTimeout(() => {
      if (window.location.pathname !== '/dashboard/wallet') {
        setIsVisible(true);
      }
      cycleCountRef.current += 1;
    }, delay);
  };

  const handleAction = () => {
    setIsVisible(false);
    router.push("/dashboard/wallet");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 right-6 z-[100] w-[340px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-zinc-200 overflow-hidden"
        >
          <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white font-bold text-sm tracking-wide">Unlock Your Power</span>
            </div>
            <button 
              onClick={handleClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-5">
            <h3 className="font-extrabold text-zinc-900 text-lg mb-2 leading-tight">
              Hooray! You have {wallet?.credits.toLocaleString()} Credits available.
            </h3>
            <p className="text-sm text-zinc-600 mb-5 font-medium leading-relaxed">
              Don't let them sit idle! Convert your credits into Wallet Balance to list properties securely on our premium platform.
            </p>
            
            <button 
              onClick={handleAction}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              Convert for Listing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
