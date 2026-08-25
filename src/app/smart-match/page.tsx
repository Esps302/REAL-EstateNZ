"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { Property } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { X, Heart, Home, MapPin, Bed, Bath, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";

export interface SwipeableCardRef {
  swipe: (dir: "left" | "right") => void;
}

export default function SmartMatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<SwipeableCardRef>(null);
  const { toggleFavorite, isFavorited } = useFavorites();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const snap = await getDocs(collection(db, "properties"));
        const fetched: Property[] = [];
        snap.forEach(doc => {
          const data = doc.data() as Property;
          if (data.status === "approved" || !data.status) {
            fetched.push({ ...data, id: doc.id });
          }
        });
        // Shuffle properties for a random feed
        const shuffled = fetched.sort(() => Math.random() - 0.5);
        setProperties(shuffled);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleSwipe = async (direction: "left" | "right", property: Property) => {
    if (direction === "right" && property.id) {
      if (user) {
        if (!isFavorited(property.id)) {
          await toggleFavorite(property.id);
        } else {
          toast.success("Already in favorites!");
        }
      } else {
        toast.error("Please login to save properties!");
      }
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-zinc-800 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 font-medium">Finding perfect matches...</p>
      </div>
    );
  }

  if (currentIndex >= properties.length) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <Home className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">You're all caught up!</h2>
        <p className="text-zinc-400 mb-8 max-w-md">We've shown you all available properties. Check back later for new listings or view your saved matches.</p>
        <div className="flex gap-4">
          <Link href="/saved" className="px-6 py-3 bg-white text-zinc-900 rounded-full font-bold hover:bg-zinc-100 transition-colors">
            View Saved
          </Link>
          <Link href="/" className="px-6 py-3 bg-zinc-800 text-white rounded-full font-bold hover:bg-zinc-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const currentProperty = properties[currentIndex];

  return (
    <div className="h-[calc(100dvh-64px)] bg-zinc-950 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 z-10 pt-4">
        <button onClick={() => router.back()} className="w-10 h-10 bg-zinc-900/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
          Smart<span className="text-pink-500">Match</span>
        </div>
        <Link href="/saved" className="w-10 h-10 bg-zinc-900/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-zinc-800 transition-colors">
          <Heart className="w-5 h-5 fill-current" />
        </Link>
      </div>

      {/* Main Swiper Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        <SwipeableCard 
          ref={cardRef}
          key={currentProperty.id} 
          property={currentProperty} 
          onSwipe={(dir: "left" | "right") => handleSwipe(dir, currentProperty)} 
        />
      </div>

      {/* Controls */}
      <div className="h-24 flex items-center justify-center gap-6 pb-4 z-10 shrink-0">
        <button 
          onClick={() => cardRef.current?.swipe("left")}
          className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg border border-zinc-800"
        >
          <X className="w-7 h-7" />
        </button>
        <button 
          onClick={() => cardRef.current?.swipe("right")}
          className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg border border-zinc-800"
        >
          <Heart className="w-7 h-7 fill-current" />
        </button>
      </div>
    </div>
  );
}

const SwipeableCard = forwardRef<SwipeableCardRef, { property: Property, onSwipe: (dir: "left" | "right") => void }>(({ property, onSwipe }, ref) => {
  const router = useRouter();
  const controls = useAnimation();
  const [exitX, setExitX] = useState(0);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);

  useImperativeHandle(ref, () => ({
    swipe: (dir: "left" | "right") => {
      setSwipeDir(dir);
      controls.start({ 
        x: dir === "left" ? -500 : 500, 
        opacity: 0, 
        rotate: dir === "left" ? -15 : 15, 
        transition: { duration: 0.3 } 
      }).then(() => {
        onSwipe(dir);
      });
    }
  }));

  useEffect(() => {
    controls.start({ opacity: 1, scale: 1, y: 0, x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
  }, [controls]);


  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitX(300);
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      setExitX(-300);
      onSwipe("left");
    } else {
      controls.start({ x: 0, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (info.offset.x > 50) setSwipeDir("right");
    else if (info.offset.x < -50) setSwipeDir("left");
    else setSwipeDir(null);
  };

  const imageSrc = property.images && property.images.length > 0 ? property.images[0] : "/images/placeholder-house.jpg";

  return (
    <motion.div
      className="absolute w-[calc(100%-2rem)] sm:w-[400px] md:w-[420px] h-[calc(100%-2rem)] max-h-[650px] rounded-3xl overflow-hidden shadow-2xl bg-zinc-900 cursor-grab active:cursor-grabbing border border-zinc-800"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onDrag={handleDrag}
      onTap={() => router.push(`/property/${property.id}`)}
      animate={controls}
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      exit={{ x: exitX, opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      style={{ originX: 0.5, originY: 1 }}
      whileDrag={{ scale: 1.05, rotate: swipeDir === "right" ? 5 : swipeDir === "left" ? -5 : 0 }}
    >
      <div className="absolute inset-0 w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageSrc} 
          alt={property.title || "Property"} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/90"></div>
      </div>

      {/* Swipe Indicators */}
      <AnimatePresence>
        {swipeDir === "right" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 font-black text-3xl px-4 py-2 rounded-xl uppercase rotate-[-15deg]"
          >
            LIKE
          </motion.div>
        )}
        {swipeDir === "left" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-black text-3xl px-4 py-2 rounded-xl uppercase rotate-[15deg]"
          >
            NOPE
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 w-full p-6 text-white">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1 drop-shadow-md">
              ${(property.price || 0).toLocaleString()}
            </h2>
            <div className="flex items-center gap-2 text-zinc-300 font-medium">
              <MapPin className="w-4 h-4" />
              {property.city || property.address}
            </div>
          </div>
        </div>
        
        <p className="text-lg font-medium text-white/90 line-clamp-1 mb-4 drop-shadow-sm">
          {property.title}
        </p>

        <div className="flex items-center gap-4 text-sm font-semibold bg-white/10 backdrop-blur-md rounded-xl p-3 w-fit border border-white/10">
          <div className="flex items-center gap-1.5"><Bed className="w-4 h-4" /> {property.bedrooms || 0}</div>
          <div className="w-1 h-1 rounded-full bg-white/30"></div>
          <div className="flex items-center gap-1.5"><Bath className="w-4 h-4" /> {property.bathrooms || 0}</div>
          <div className="w-1 h-1 rounded-full bg-white/30"></div>
          <div className="flex items-center gap-1.5">{property.area || 0} m²</div>
        </div>
      </div>
    </motion.div>
  );
});
SwipeableCard.displayName = "SwipeableCard";
