"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Clock, TrendingUp, Gavel, ArrowUpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";

interface Bid {
  id: string;
  amount: number;
  userId: string;
  userName: string;
  userPhone?: string;
  createdAt: any;
}

interface LiveAuctionProps {
  propertyId: string;
  startingPrice: number;
}

export default function LiveAuction({ propertyId, startingPrice }: LiveAuctionProps) {
  const { user, userData } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidderName, setBidderName] = useState<string>("");
  const [bidderPhone, setBidderPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("02:00:00");
  const [flash, setFlash] = useState(false);

  const highestBid = bids.length > 0 ? bids[0].amount : startingPrice;

  useEffect(() => {
    if (user && userData) {
      if (!bidderName) setBidderName(userData.name || user.displayName || "");
      if (!bidderPhone) setBidderPhone(userData.phone || "");
    }
  }, [user, userData]);

  // 24-hour countdown timer (resets at midnight)
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time bids listener
  useEffect(() => {
    const q = query(
      collection(db, "properties", propertyId, "bids"),
      orderBy("amount", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBids: Bid[] = [];
      snapshot.forEach((doc) => {
        fetchedBids.push({ id: doc.id, ...doc.data() } as Bid);
      });
      
      setBids(prev => {
        if (prev.length > 0 && fetchedBids.length > 0 && fetchedBids[0].amount > prev[0].amount) {
          // Trigger flash animation for new highest bid
          setFlash(true);
          setTimeout(() => setFlash(false), 1000);
          
          // Play a sound effect if available
          try {
            const audio = new Audio('/sounds/mixkit-gold-coin-prize-1999.wav');
            audio.play().catch(e => console.log('Audio play failed', e));
          } catch(e){}
        }
        return fetchedBids;
      });
    });

    return () => unsubscribe();
  }, [propertyId]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to place a bid.");
      return;
    }
    
    const amountNum = Number(bidAmount);
    if (isNaN(amountNum) || amountNum <= highestBid) {
      toast.error(`Your bid must be higher than $${highestBid.toLocaleString()}`);
      return;
    }
    if (!bidderName.trim() || !bidderPhone.trim()) {
      toast.error("Please provide your name and mobile number.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "properties", propertyId, "bids"), {
        amount: amountNum,
        userId: user.uid,
        userName: bidderName,
        userPhone: bidderPhone,
        createdAt: serverTimestamp()
      });
      
      // Also send a notification to admin
      await addDoc(collection(db, "notifications"), {
        userId: "admin_system",
        title: "New Auction Bid Placed",
        message: `${bidderName} (Ph: ${bidderPhone}) placed a bid of $${amountNum.toLocaleString()}.`,
        type: "success",
        isRead: false,
        isPoppedUp: false,
        link: `/admin/offers`,
        createdAt: Date.now()
      });

      if (user.email) {
        sendNotificationEmail({
          to: user.email,
          templateType: "userActionConfirmation",
          payload: {
            userName: bidderName,
            actionTitle: "Live Auction Bid Placed",
            actionMessage: "Your bid has been successfully recorded in the live auction.",
            actionDetails: {
              "Bid Amount": `$${amountNum.toLocaleString()}`,
            }
          }
        });
      }

      setBidAmount("");
      toast.success("Bid placed successfully!");
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Failed to place bid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden relative mt-8">
      <div className="bg-zinc-950 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wide text-sm">
          <Gavel className="w-5 h-5 text-red-500" />
          Live Auction
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold border border-red-500/30">
          <Clock className="w-4 h-4" />
          {timeLeft}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <p className="text-sm text-zinc-500 font-medium mb-1 uppercase tracking-wider">Current Highest Bid</p>
          <motion.div 
            animate={flash ? { scale: [1, 1.05, 1], color: ["#18181b", "#10b981", "#18181b"] } : {}}
            transition={{ duration: 0.5 }}
            className="text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-3"
          >
            ${highestBid.toLocaleString()}
            {bids.length > 0 && <TrendingUp className="w-6 h-6 text-emerald-500" />}
          </motion.div>
          {bids.length > 0 && (
            <p className="text-sm font-medium text-emerald-600 mt-2 flex items-center gap-1.5">
              Held by {bids[0].userId === user?.uid ? "You!" : bids[0].userName}
            </p>
          )}
        </div>

        {/* Bid History */}
        <div className="mb-6">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-2 mb-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recent Bids</h4>
            <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{bids.length} Total Bids</span>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {bids.slice(0, 4).map((bid, index) => (
                <motion.div 
                  key={bid.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex justify-between items-center p-3 rounded-lg text-sm font-medium ${
                    index === 0 
                      ? "bg-emerald-50 border border-emerald-100 text-emerald-900" 
                      : "bg-zinc-50 text-zinc-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {index === 0 && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                    <div className="flex flex-col">
                      <span>{bid.userId === user?.uid ? "You" : bid.userName}</span>
                      {bid.createdAt && (
                        <span className="text-[10px] text-zinc-400 font-normal">
                          {bid.createdAt.toDate ? bid.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Just now"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-bold">
                    ${bid.amount.toLocaleString()}
                  </div>
                </motion.div>
              ))}
              {bids.length === 0 && (
                <div className="text-sm text-zinc-500 italic py-2">No bids yet. Be the first!</div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bid Form */}
        <form onSubmit={handlePlaceBid} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={bidderName}
              onChange={(e) => setBidderName(e.target.value)}
              placeholder="e.g. Your Name *"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
            <input
              type="tel"
              required
              value={bidderPhone}
              onChange={(e) => setBidderPhone(e.target.value)}
              placeholder="0987654321 *"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</div>
            <input
              type="number"
              required
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Min. ${(highestBid + 1000).toLocaleString()} *`}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-4 pl-8 pr-32 font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-red-600 hover:bg-red-700 text-white px-4 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ArrowUpCircle className="w-4 h-4" />}
              Place Bid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
