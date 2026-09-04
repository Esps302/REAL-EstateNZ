"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Bed, Bath, Square, CheckCircle2, Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/context/AuthContext";
import { Property } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";

export default function PropertyCard({ property }: { property: Property }) {
 const { toggleFavorite, isFavorited, loading: favLoading } = useFavorites();
 const { userData } = useAuth();
 const [currentImageIndex, setCurrentImageIndex] = useState(0);
 const [isHovered, setIsHovered] = useState(false);
 const [mounted, setMounted] = useState(false);
 const [flyingHearts, setFlyingHearts] = useState<{id: string, startX: number, startY: number, targetX: number, targetY: number}[]>([]);
 
 useEffect(() => setMounted(true), []);
 
 const images = property.images && property.images.length > 0 ? property.images : ["/hero.png"];

 const nextImage = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 setCurrentImageIndex((prev) => (prev + 1) % images.length);
 };

 const prevImage = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
 };

 return (
 <>
 <Link 
 href={`/property/${property.id}`} 
 className="group flex flex-row sm:flex-col bg-white rounded-md overflow-hidden border border-zinc-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 min-h-[130px]"
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 >
 <div className="relative w-[130px] sm:w-full sm:aspect-[16/9] flex-shrink-0 overflow-hidden bg-zinc-100">
 <AnimatePresence mode="popLayout">
 <motion.div
 key={currentImageIndex}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.3 }}
 className="absolute inset-0 w-full h-full"
 >
 <Image 
 src={images[currentImageIndex]} 
 alt={property.title}
 fill
 className="object-cover transition-transform duration-700 group-hover:scale-110"
 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
 />
 </motion.div>
 </AnimatePresence>

 {/* Carousel Controls */}
 <AnimatePresence>
 {isHovered && images.length > 1 && (
 <>
 <motion.button
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 onClick={prevImage}
 className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-zinc-900 p-1 rounded shadow-md backdrop-blur-sm transition-all z-20"
 >
 <ChevronLeft className="w-5 h-5" />
 </motion.button>
 <motion.button
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 10 }}
 onClick={nextImage}
 className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-zinc-900 p-1 rounded shadow-md backdrop-blur-sm transition-all z-20"
 >
 <ChevronRight className="w-5 h-5" />
 </motion.button>
 </>
 )}
 </AnimatePresence>

 {/* Dot Indicators */}
 {images.length > 1 && (
 <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
 {images.map((_, idx) => (
 <div 
 key={idx} 
 className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 shadow-sm'}`}
 />
 ))}
 </div>
 )}

 {/* Badges */}
 <div className="absolute top-2 left-2 z-20 bg-white/90 backdrop-blur-md text-zinc-900 text-[10px] font-extrabold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
 {property.propertyType}
 </div>
 
 {property.status === "approved" && (
 <div className="absolute top-2 right-10 z-20 bg-emerald-500 text-white p-1 rounded shadow-sm">
 <CheckCircle2 className="w-3.5 h-3.5" />
 </div>
 )}
 
 <button 
 onClick={(e) => { 
 e.preventDefault(); 
 e.stopPropagation(); 
 
 if (!isFavorited(property.id) && mounted) {
 const rect = e.currentTarget.getBoundingClientRect();
 const startX = rect.left + rect.width / 2;
 const startY = rect.top + rect.height / 2;
 
 let targetEl = document.getElementById("navbar-heart-icon");
 if (!targetEl || targetEl.getBoundingClientRect().width === 0) {
 targetEl = document.getElementById("mobile-heart-icon");
 }
 
 if (targetEl) {
 const targetRect = targetEl.getBoundingClientRect();
 const targetX = targetRect.left + targetRect.width / 2;
 const targetY = targetRect.top + targetRect.height / 2;
 
 const id = Date.now().toString() + Math.random();
 setFlyingHearts(prev => [...prev, { id, startX, startY, targetX, targetY }]);
 
 setTimeout(() => {
 setFlyingHearts(prev => prev.filter(h => h.id !== id));
 }, 1200);
 }
 }
 
 toggleFavorite(property.id); 
 }}
 disabled={favLoading}
 className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-md p-1.5 rounded shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
 >
 <Heart className={`w-4 h-4 ${isFavorited(property.id) ? 'fill-red-500 text-red-500' : 'text-zinc-600'}`} />
 </button>
 </div>

 <div className="p-2 sm:p-3 flex flex-col flex-grow relative z-30 bg-white min-w-0">
        <div className="text-sm sm:text-base font-extrabold text-zinc-900 mb-0.5 line-clamp-1">
          {(userData?.role === 'admin' || userData?.role === 'super_admin' || userData?.role === 'seller') 
            ? (property?.price === 0 ? "By Negotiation" : `${formatCurrency(property.price, property.currency)} ${property.listingType === 'For Rent' ? (property.rentFrequency === 'Monthly' ? '/ month' : '/ week') : ''}`)
            : property.title
          }
        </div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs sm:text-sm font-bold text-zinc-700 line-clamp-1">
            {(userData?.role === 'admin' || userData?.role === 'super_admin' || userData?.role === 'seller') ? property.title : property.listingType}
          </div>
          {property.averageRating ? (
            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold border border-amber-200">
              <Star className="w-3 h-3 fill-amber-500" />
              {property.averageRating.toFixed(1)}
            </div>
          ) : null}
        </div>
 <div className="text-zinc-500 text-[10px] sm:text-xs font-medium flex items-start gap-1 sm:gap-1.5 mb-2 flex-grow">
 <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 flex-shrink-0 text-zinc-400" />
 <span className="line-clamp-2 leading-tight">{property.address || `${property.suburb}, ${property.city}`}</span>
 </div>
 <div className="flex flex-wrap items-center justify-between border-t border-zinc-100 pt-2 text-zinc-600 text-[10px] sm:text-xs font-bold gap-1 sm:gap-2">
 <div className="flex items-center gap-1 sm:gap-1.5"><Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" /> {property.bedrooms}</div>
 <div className="flex items-center gap-1 sm:gap-1.5"><Bath className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" /> {property.bathrooms}</div>
 <div className="flex items-center gap-1 sm:gap-1.5"><Square className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" /> {property.area} sqft</div>
 </div>
 </div>
 </Link>
 
 {mounted && typeof window !== "undefined" && createPortal(
 <>
 {flyingHearts.map(heart => (
 <motion.div
 key={heart.id}
 initial={{ x: heart.startX, y: heart.startY, scale: 1, opacity: 1 }}
 animate={{ 
 x: heart.targetX, 
 y: heart.targetY, 
 scale: 0.2, 
 opacity: 0
 }}
 transition={{ duration: 1.2, ease: "easeInOut" }}
 className="fixed z-[99999] pointer-events-none origin-center"
 style={{ top: 0, left: 0, marginLeft: -12, marginTop: -12 }}
 >
 <Heart className="w-6 h-6 fill-red-500 text-red-500 shadow-xl drop-shadow-2xl" />
 </motion.div>
 ))}
 </>,
 document.body
 )}
 </>
 );
}
