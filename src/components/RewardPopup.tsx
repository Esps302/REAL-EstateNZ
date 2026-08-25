"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, X, Wallet, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const goldCoinAudio = typeof window !== "undefined" ? new Audio("/sounds/mixkit-gold-coin-prize-1999.wav") : null;
if (goldCoinAudio) {
  goldCoinAudio.preload = "auto";
}

export default function RewardPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [rewardData, setRewardData] = useState<{ amount: number, reason: string } | null>(null);
  const { wallet } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const playSuccessSound = () => {
      try {
        if (goldCoinAudio) {
          goldCoinAudio.currentTime = 0; // Reset to start
          goldCoinAudio.volume = 0.6; // Not too loud
          const playPromise = goldCoinAudio.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error("Browser blocked audio playback:", err);
            });
          }
        }
      } catch (e) {
        console.error("Audio initialization failed", e);
      }
    };

    const handleReward = (e: any) => {
      setRewardData(e.detail);
      setIsOpen(true);
      playSuccessSound();
      
      // Auto close after 8 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 8000);
    };

    window.addEventListener("rewardEarned", handleReward);
    return () => window.removeEventListener("rewardEarned", handleReward);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && rewardData && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-4 relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="text-2xl">🎉</span> Congratulations!
            </div>
          </div>
          
          {/* Body */}
          <div className="p-5 text-center">
            <p className="text-zinc-600 font-medium mb-2">You just unlocked</p>
            <div className="flex justify-center items-center gap-2 text-3xl font-extrabold text-amber-500 mb-3">
              <Star className="w-8 h-8 fill-amber-500 animate-pulse" />
              {rewardData.amount} Credits!
            </div>
            <p className="text-sm text-zinc-600 mb-4 px-2">
              For: <span className="font-bold text-zinc-900">{rewardData.reason}</span>
            </p>
            
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5 text-left shadow-inner">
              <p className="text-sm font-semibold text-amber-900 mb-1">Ready to use your credits?</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Head over to your wallet to convert these credits into real balance and unlock premium features! 💰
              </p>
            </div>

            <button 
              onClick={() => {
                setIsOpen(false);
                router.push("/dashboard/wallet");
              }} 
              className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" /> Go To Wallet <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
