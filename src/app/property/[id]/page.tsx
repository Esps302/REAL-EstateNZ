"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Property } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Bed, Bath, Square, ChevronRight, Heart, ShieldCheck, Check, CheckCircle, HelpCircle, Landmark, Briefcase, Activity, Home, Calendar, Car, Info, UserCircle, Phone, Mail, X, ChevronLeft, Waves, Wind, Flame, TreePine, Dumbbell, Sun, Wifi, Monitor, PawPrint, Mountain, Utensils, ArrowUpDown, AppWindow, Star, MessageCircle, FileText, TrendingUp, Download, PieChart, Clock } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { OfferModal } from "@/components/OfferModal";
import { ServiceRequestModal } from "@/components/ServiceRequestModal";
import { formatCurrency } from "@/utils/formatCurrency";
import { ViewingModal } from "@/components/ViewingModal";
import ReviewSection from "@/components/ReviewSection";
import MortgageCalculator from "@/components/MortgageCalculator";
import DocumentLeadGen from "@/components/DocumentLeadGen";
import NeighborhoodAnalytics from "@/components/NeighborhoodAnalytics";
import LiveAuction from "@/components/LiveAuction";
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-zinc-100 animate-pulse border border-zinc-300"></div> 
});

const getAmenityIcon = (amenity: string) => {
  const lower = amenity.toLowerCase();
  if (lower.includes('pool') || lower.includes('spa') || lower.includes('hot tub')) return <Waves className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('air') || lower.includes('ac ') || lower.includes('cooling')) return <Wind className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('heat') || lower.includes('fire')) return <Flame className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('garden') || lower.includes('yard') || lower.includes('outdoor')) return <TreePine className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('gym') || lower.includes('fitness')) return <Dumbbell className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('balcony') || lower.includes('deck') || lower.includes('patio')) return <Sun className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('wifi') || lower.includes('internet') || lower.includes('broadband')) return <Wifi className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('smart') || lower.includes('tv') || lower.includes('media')) return <Monitor className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('garage') || lower.includes('parking') || lower.includes('car')) return <Car className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('alarm') || lower.includes('security')) return <ShieldCheck className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) return <PawPrint className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('mountain') || lower.includes('view')) return <Mountain className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('dishwasher') || lower.includes('kitchen')) return <Utensils className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('elevator') || lower.includes('lift')) return <ArrowUpDown className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  if (lower.includes('window') || lower.includes('double glazed')) return <AppWindow className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
  return <CheckCircle className="w-5 h-5 text-[#0073e6] flex-shrink-0" />;
};

 export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
 const { toggleFavorite, isFavorited, loading: favLoading } = useFavorites();

  // Mobile Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [initialServiceType, setInitialServiceType] = useState<'viewing' | 'mortgage' | 'solicitor' | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);

  const [brokerName, setBrokerName] = useState("Mike Pankaj");
  const [brokerAvatarUrl, setBrokerAvatarUrl] = useState("/mike_pankaj.png");

  useEffect(() => {
    const fetchPropertyAndSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, "properties", params.id));
        
        if (docSnap.exists()) {
          const propertyData = { id: docSnap.id, ...docSnap.data() } as Property;
          // For testing: Only show the floor plan on sale properties that don't have one
          if (propertyData.listingType === "For Sale" && !propertyData.floorPlan) {
            propertyData.floorPlan = "/images/kk.jpg";
          }
          setProperty(propertyData);
        } else {
          setError("Property not found");
        }

        try {
          const settingsSnap = await getDoc(doc(db, "settings", "site"));
          if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            if (data.brokerName) setBrokerName(data.brokerName);
            if (data.brokerAvatarUrl) setBrokerAvatarUrl(data.brokerAvatarUrl);
          }
        } catch (e) {
          console.warn("Could not load site settings for broker (using defaults)", e);
        }
      } catch (err) {
        console.error("Failed to fetch property", err);
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyAndSettings();
  }, [params.id]);

  const renderPricingBox = (className = "") => (
    <div className={`bg-white border border-zinc-300 rounded-sm shadow-sm overflow-hidden mb-4 ${className}`}>
      {/* Decorative top accent */}
      <div className="h-1.5 w-full bg-[#0073e6]"></div>
      
      {/* Price Header */}
      <div className="p-5 border-b border-zinc-100 bg-gradient-to-b from-white to-zinc-50 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#0073e6] uppercase tracking-wider mb-1">Pricing Strategy</p>
          <p className="text-2xl font-extrabold text-zinc-900 leading-tight">
            {(userData?.role === 'admin' || userData?.role === 'super_admin' || userData?.role === 'seller')
              ? (property?.isSold 
                ? "Sold" 
                : (property?.price === 0 ? "By Negotiation" : formatCurrency(property?.price || 0, property?.currency)))
              : (property?.isSold ? "Sold" : `By ${brokerName}`)
            }
          </p>
          <p className="text-xs text-zinc-500 mt-1">Submit an offer to see Smart Match probability</p>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-emerald-800 leading-snug">
          <strong>Secure Digital Brokerage</strong><br />
          Direct seller contact is disabled. All inquiries and offers are managed securely by the platform team.
        </p>
      </div>

      {/* Actions */}
      <div className="p-5 space-y-3">
        <button 
          onClick={() => setIsViewingModalOpen(true)}
          className="w-full py-3 bg-zinc-900 hover:bg-black text-white font-bold rounded-sm text-sm transition-colors text-center shadow-md flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Schedule a Viewing
        </button>
        <button 
          onClick={() => setIsOfferModalOpen(true)}
          className="w-full py-3 bg-[#0073e6] hover:bg-[#005bb5] text-white font-bold rounded-sm text-sm transition-colors text-center shadow-md"
        >
          Make an Offer
        </button>
        <button 
          onClick={() => { setInitialServiceType(null); setIsServiceModalOpen(true); }}
          className="w-full py-3 bg-white border-2 border-[#0073e6] hover:bg-blue-50 text-[#0073e6] font-bold rounded-sm text-sm transition-colors text-center"
        >
          Request Services
        </button>
      </div>
    </div>
  );

  const handleContactAgent = () => {
    // New Zealand number format (replace with your actual business number, ensure country code is present)
    const phoneNumber = "64215550192"; // 021 555 0192 -> +64 21 555 0192
    
    // Construct the pre-filled message
    const message = `Hi Mike, I am interested in ${property?.title || "your property listing"}. Could you please let me know the price?`;
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
  };

  const renderAgentBox = (className = "") => (
    <>
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        .animate-shine {
          animation: shine 3s infinite ease-in-out;
        }
      `}</style>
      <div className={`relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 overflow-hidden mb-6 transition-all duration-500 hover:shadow-[0_24px_50px_rgb(0,0,0,0.08)] hover:-translate-y-1 group ${className}`}>
        
        {/* Ultra-Premium Header Background */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black overflow-hidden">
          {/* Texture Grid */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          {/* Glowing Orbs */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full mix-blend-screen"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full mix-blend-screen"></div>
        </div>

        <div className="relative pt-6 px-6 pb-6">
          
          {/* Header Tags */}
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[9px] font-black text-white/90 uppercase tracking-[0.2em] bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
              Listing Agent
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-200 bg-amber-500/20 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-[0.1em] border border-amber-500/30 shadow-sm">
              <Star className="w-3 h-3 fill-amber-200 text-amber-200" /> Top Broker
            </span>
          </div>

          {/* Avatar Profile */}
          <div className="flex flex-col items-center mt-3 mb-5 relative z-10">
            <div className="relative mb-5 group-hover:scale-105 transition-transform duration-500">
              {/* Pulsing glow behind avatar */}
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-zinc-200 relative ring-1 ring-black/5">
                <Image 
                  src={brokerAvatarUrl} 
                  alt={brokerName}
                  fill
                  priority
                  sizes="128px"
                  className="object-cover"
                />
                {/* Diagonal Shooting Star Shine Effect */}
                <div className="absolute top-0 left-0 h-full w-[40%] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shine pointer-events-none z-20"></div>
              </div>
              
              {/* Shimmering Glowing Orb (Replacing Green Dot & Star) */}
            <div className="absolute bottom-2 right-2 z-20">
              <span className="relative flex h-5 w-5 group-hover:scale-110 transition-transform">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-tr from-[#0073e6] to-cyan-300 border-2 border-white shadow-md overflow-hidden">
                  <span className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shine"></span>
                </span>
              </span>
            </div>
          </div>
            
            <div className="text-center w-full">
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight leading-tight mb-1 flex items-center justify-center gap-1.5">
                {brokerName}
                <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-50" />
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 to-zinc-400">
                Senior Consultant
              </p>
              
              {property?.averageRating && property?.reviewCount ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold w-full mb-2">
                  <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 shadow-sm transition-transform hover:scale-105 cursor-default">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{property.averageRating.toFixed(1)} ({property.reviewCount} Reviews)</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
            <a href="tel:0215550192" className="relative flex flex-col items-center justify-center p-3.5 bg-zinc-50/50 rounded-xl border border-zinc-100 hover:border-blue-200 hover:bg-white hover:shadow-md transition-all duration-300 group/contact cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/0 group-hover/contact:bg-blue-50/30 transition-colors"></div>
              <Phone className="w-5 h-5 text-zinc-400 group-hover/contact:text-blue-600 mb-2 transition-colors relative z-10" />
              <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest relative z-10">Call</span>
              <span className="text-[11px] font-medium text-zinc-500 truncate w-full text-center mt-0.5 relative z-10">021 555 0192</span>
            </a>
            <a href="mailto:j.harrison@nzestates.co.nz" className="relative flex flex-col items-center justify-center p-3.5 bg-zinc-50/50 rounded-xl border border-zinc-100 hover:border-blue-200 hover:bg-white hover:shadow-md transition-all duration-300 group/contact cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/0 group-hover/contact:bg-blue-50/30 transition-colors"></div>
              <Mail className="w-5 h-5 text-zinc-400 group-hover/contact:text-blue-600 mb-2 transition-colors relative z-10" />
              <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest relative z-10">Email</span>
              <span className="text-[11px] font-medium text-zinc-500 truncate w-full text-center mt-0.5 relative z-10">j.harrison@...</span>
            </a>
          </div>
          
          {/* Action Button */}
          <button 
            onClick={handleContactAgent}
            className="relative w-full py-4 overflow-hidden rounded-xl group/btn transition-transform active:scale-95 shadow-[0_4px_20px_0_rgba(0,115,230,0.3)] hover:shadow-[0_8px_25px_rgba(0,115,230,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0073e6] to-[#005bb5] transition-transform duration-500 group-hover/btn:scale-105"></div>
            {/* Gentle animated glass sheen using transforms */}
            <div className="absolute top-0 -left-[100%] h-full w-[200%] z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-full transition-all duration-1000 ease-in-out"></div>
            
            <div className="relative flex items-center justify-center gap-2 text-white font-bold text-sm z-10">
              <MessageCircle className="w-5 h-5" />
              Message {brokerName.split(' ')[0]}
            </div>
          </button>
          
          <p className="text-[9px] text-zinc-400 text-center mt-4 font-black flex items-center justify-center gap-1.5 uppercase tracking-widest">
            <Activity className="w-3 h-3 text-emerald-500" /> Usually responds quickly
          </p>
        </div>
      </div>
    </>
  );

 if (loading) {
 return (
 <div className="min-h-screen bg-zinc-50 py-8 px-4">
 <div className="max-w-[1500px] mx-auto animate-pulse flex flex-col lg:flex-row gap-8">
 <div className="flex-1 space-y-4">
 <div className="h-[450px] bg-zinc-200"></div>
 <div className="h-20 bg-zinc-200"></div>
 <div className="h-40 bg-zinc-200"></div>
 </div>
 <div className="w-full lg:w-[380px] h-[300px] bg-zinc-200"></div>
 </div>
 </div>
 );
 }

 if (error || !property) {
 return (
 <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
 <div className="bg-white p-8 border border-zinc-300 text-center max-w-sm">
 <h2 className="text-xl font-bold text-zinc-900 mb-2">Not Found</h2>
 <p className="text-zinc-600 mb-6">{error || "Property not found."}</p>
 <button onClick={() => router.push("/search")} className="w-full bg-blue-600 text-white font-bold py-2 hover:bg-blue-700 transition-colors">
 Back to Search
 </button>
 </div>
 </div>
 );
 }

 const isFav = isFavorited(property.id);

 return (
 <div className="min-h-screen bg-[#F1F3F5] font-sans pb-12">
 
 {/* Breadcrumbs */}
 <div className="bg-white border-b border-zinc-200 py-3">
 <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 text-sm text-blue-600 flex items-center gap-2">
 <Link href="/" className="hover:underline">Home</Link>
 <ChevronRight className="w-4 h-4 text-zinc-400" />
 <Link href="/search" className="hover:underline">Properties</Link>
 <ChevronRight className="w-4 h-4 text-zinc-400" />
 <span className="text-zinc-500">{property.suburb}</span>
 </div>
 </div>

  <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
  
  {/* Title Section */}
  <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
  <div>
  <h1 className="text-2xl font-bold text-zinc-900 mb-1 flex items-center gap-3">
  {property.title}
  {property.averageRating && property.averageRating > 0 && (
    <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded text-sm font-extrabold border border-amber-200">
      <Star className="w-4 h-4 fill-amber-500" />
      {property.averageRating.toFixed(1)}
    </span>
  )}
  </h1>
  <p className="text-base text-zinc-600 flex items-center gap-1">
  <MapPin className="w-4 h-4" />
  {property.address ? `${property.address}, ` : ''}{property.suburb}, {property.city}
  </p>
  </div>
  <button 
  onClick={() => toggleFavorite(property.id)}
  disabled={favLoading}
  className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline"
  >
  <Heart className={`w-5 h-5 ${isFav ? 'fill-blue-600' : ''}`} />
  {isFav ? 'Saved to Watchlist' : 'Add to Watchlist'}
  </button>
  </div>

  {/* Enhanced Image Gallery (Premium Airbnb Style) */}
  <div className="mb-8 relative">
    <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-3 gap-2 h-[300px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden group/gallery">
      {/* Main Large Image */}
      <div 
        className={`relative w-full h-full cursor-pointer overflow-hidden ${property.images?.length && property.images.length >= 7 ? 'md:col-span-4 md:row-span-3' : 'col-span-1 md:col-span-6 md:row-span-3'}`}
        onClick={() => { setCurrentImageIndex(0); setIsImageModalOpen(true); }}
      >
        <Image 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'} 
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover transition-transform duration-700 hover:scale-[1.03]"
          priority
        />
        <div className="absolute inset-0 bg-black/0 group-hover/gallery:bg-black/20 hover:!bg-transparent transition-colors duration-300 pointer-events-none"></div>
        {/* Labels */}
        <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md text-zinc-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm border border-white/50">
            {property.propertyType}
          </div>
        </div>
      </div>

      {/* Extra images for desktop (7+ images layout) */}
      {property.images && property.images.length >= 7 && (
        <>
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="relative hidden md:block cursor-pointer overflow-hidden md:col-span-1 md:row-span-1" onClick={() => { setCurrentImageIndex(idx); setIsImageModalOpen(true); }}>
              <Image src={property.images[idx]} alt={property.title} fill sizes="16vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-black/0 group-hover/gallery:bg-black/20 hover:!bg-transparent transition-colors duration-300 pointer-events-none"></div>
            </div>
          ))}
        </>
      )}
      
      {/* Extra images for desktop (fallback for fewer than 7 images but more than 1) */}
      {property.images && property.images.length > 1 && property.images.length < 7 && (
        property.images.slice(1, 7).map((img, idx) => (
          <div key={idx} className="relative hidden md:block cursor-pointer overflow-hidden md:col-span-2 md:row-span-1" onClick={() => { setCurrentImageIndex(idx + 1); setIsImageModalOpen(true); }}>
            <Image src={img} alt={property.title} fill sizes="33vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover/gallery:bg-black/20 hover:!bg-transparent transition-colors duration-300 pointer-events-none"></div>
          </div>
        ))
      )}
    </div>

    {/* View All Photos Button */}
    {property.images && property.images.length > 1 && (
      <button 
        onClick={() => { setCurrentImageIndex(0); setIsImageModalOpen(true); }}
        className="absolute bottom-6 right-6 bg-white hover:bg-zinc-100 text-zinc-900 px-4 py-2.5 rounded-lg font-bold text-sm shadow-[0_2px_15px_rgb(0,0,0,0.1)] flex items-center gap-2 transition-all border border-zinc-200 active:scale-95 z-10"
      >
        <AppWindow className="w-4 h-4" />
        Show all {property.images.length} photos
      </button>
    )}
  </div>

  <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column (Main Content) */}
        <div className="flex-1 min-w-0">
          
          {/* Mobile Actions - ONLY VISIBLE ON MOBILE */}
          <div className="block lg:hidden mt-2 mb-6">
            {renderPricingBox()}
            {renderAgentBox()}
          </div>
          
          {/* Property Key Details Grid (Dense) */}
          <div className="bg-white border border-zinc-300 p-6 mb-6 rounded-sm shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-5 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" /> Property Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Bedrooms</span>
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-zinc-400" />
                  <span className="text-lg font-extrabold text-zinc-900">{property.bedrooms}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Bathrooms</span>
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-zinc-400" />
                  <span className="text-lg font-extrabold text-zinc-900">{property.bathrooms}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Floor area</span>
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-zinc-400" />
                  <span className="text-lg font-extrabold text-zinc-900">{property.area} m²</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Parking</span>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-zinc-400" />
                  <span className="text-lg font-extrabold text-zinc-900">{property.parkingSpaces || "2"} Spaces</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Property type</span>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-zinc-400" />
                  <span className="text-base font-bold text-zinc-900">{property.propertyType}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Year Built</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span className="text-base font-bold text-zinc-900">{property.yearBuilt || "2020"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white border border-zinc-300 p-6 mb-6 rounded-sm shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-100">About this property</h2>
            <div className="text-zinc-700 text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
              {property.description}
            </div>
          </div>

          {/* Floor Plan Section */}
          {property.floorPlan && (
            <div className="bg-white border border-zinc-300 p-6 mb-6 rounded-sm shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Floor Plan</h2>
              <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-sm overflow-hidden bg-zinc-100 border border-zinc-200">
                <a href={property.floorPlan} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  <Image 
                    src={property.floorPlan} 
                    alt="Property Floor Plan" 
                    fill 
                    className="object-contain hover:scale-[1.02] transition-transform duration-500" 
                  />
                </a>
              </div>
              <p className="text-xs text-zinc-500 text-center mt-3">Click on the image to view in full size</p>
            </div>
          )}

          {/* Amenities Section */}
          <div className="bg-white border border-zinc-300 p-6 mb-6 rounded-sm shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Features & Amenities</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              {(property.amenities || []).map(amenity => (
                <li key={amenity} className="flex items-center gap-3 text-sm font-semibold text-zinc-800">
                  {getAmenityIcon(amenity)}
                  {amenity}
                </li>
              ))}
            </ul>
          </div>

          {/* Neighborhood Analytics */}
          <NeighborhoodAnalytics city={property.city} suburb={property.suburb} />

          {/* Need Help Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 mb-6 rounded-sm shadow-sm relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            
            <h2 className="text-lg font-bold text-zinc-900 mb-1 flex items-center gap-2 relative z-10">
               <HelpCircle className="w-5 h-5 text-blue-600" />
               Expert Help, Just a Click Away
            </h2>
            <p className="text-sm text-zinc-600 mb-5 relative z-10">
              Navigating property can be complex. Let our trusted local partners guide you.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              <button 
                onClick={() => { setInitialServiceType('mortgage'); setIsServiceModalOpen(true); }}
                className="flex items-center text-left p-4 bg-white border border-blue-100 hover:border-blue-300 hover:shadow-md rounded-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4 group-hover:bg-blue-600 transition-colors">
                  <Landmark className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <span className="block font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">Mortgage Advisor</span>
                  <span className="block text-xs text-zinc-500 mt-0.5">Get pre-approved today</span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1" />
              </button>

              <button 
                onClick={() => { setInitialServiceType('solicitor'); setIsServiceModalOpen(true); }}
                className="flex items-center text-left p-4 bg-white border border-indigo-100 hover:border-indigo-300 hover:shadow-md rounded-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mr-4 group-hover:bg-indigo-600 transition-colors">
                  <Briefcase className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <span className="block font-bold text-zinc-900 group-hover:text-indigo-700 transition-colors">Property Solicitor</span>
                  <span className="block text-xs text-zinc-500 mt-0.5">Legal advice & contracts</span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Mortgage Calculator */}
          {property.listingType === "For Sale" && (
            <MortgageCalculator propertyPrice={property.price || 0} />
          )}

          {/* Property Reviews */}
          <ReviewSection targetId={property.id} targetType="property" />
 </div>

 {/* Right Column (Action Box) */}
 <div className="w-full lg:w-[380px] flex-shrink-0">
 <div className="sticky top-6 flex flex-col gap-5">
 
            {/* Property Location Map */}
            <div className="h-[200px] w-full bg-white border border-zinc-300 relative z-0 rounded-sm overflow-hidden shadow-sm">
              <Map properties={[property]} />
            </div>

            {/* Desktop Actions - HIDDEN ON MOBILE */}
            {renderPricingBox("hidden lg:block")}
            {renderAgentBox("hidden lg:block")}

            {/* Upgraded Property Insights Box (Value/Goodwill) */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100/50 rounded-md">
                    <PieChart className="w-4 h-4 text-blue-600" />
                  </div>
                  Investment Potential
                </h3>
                
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  High Yield
                </span>
              </div>
              
              <div className="p-5 space-y-4 text-sm text-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <TrendingUp className="w-4 h-4 text-zinc-400" /> 
                    Est. Rental Yield
                  </span>
                  <span className="font-extrabold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md shadow-sm border border-zinc-200">
                    5.2% - 5.8%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-zinc-400" /> 
                    Suburb Growth (1yr)
                  </span>
                  <span className="font-bold text-emerald-600">+4.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <Activity className="w-4 h-4 text-[#0073e6]" /> 
                    Market Demand
                  </span>
                  <span className="font-bold text-zinc-900">Very High</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-2">
                  <span className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    Days on Market
                  </span>
                  <span className="text-xs font-extrabold text-zinc-600 bg-zinc-100 px-2 py-1 rounded">2 days</span>
                </div>
              </div>
            </div>

            {/* High-Value Lead Gen Magnet: Property Documents */}
            <DocumentLeadGen propertyId={property.id} propertyTitle={property.title} />

 </div>
 </div>

 </div>

 </div>

 {/* Modals */}
 {property && (
 <>
 <OfferModal 
 property={property} 
 isOpen={isOfferModalOpen} 
 onClose={() => setIsOfferModalOpen(false)} 
 />
 <ServiceRequestModal
        property={property}
        isOpen={isServiceModalOpen}
        onClose={() => { setIsServiceModalOpen(false); setInitialServiceType(null); }}
        initialService={initialServiceType}
      />
      
      <ViewingModal 
        isOpen={isViewingModalOpen}
        onClose={() => setIsViewingModalOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
      />
 
 {/* Fullscreen Image Lightbox Modal */}
 {isImageModalOpen && property.images && property.images.length > 0 && (
   <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setIsImageModalOpen(false)}>
     <button 
       onClick={() => setIsImageModalOpen(false)}
       className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-[101]"
     >
       <X className="w-6 h-6" />
     </button>
     
     {property.images.length > 1 && (
       <>
         <button 
           onClick={(e) => {
             e.stopPropagation();
             setCurrentImageIndex(prev => prev === 0 ? property.images!.length - 1 : prev - 1);
           }}
           className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-[101]"
         >
           <ChevronLeft className="w-8 h-8" />
         </button>
         <button 
           onClick={(e) => {
             e.stopPropagation();
             setCurrentImageIndex(prev => prev === property.images!.length - 1 ? 0 : prev + 1);
           }}
           className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-[101]"
         >
           <ChevronRight className="w-8 h-8" />
         </button>
       </>
     )}

     <div className="relative w-full max-w-7xl h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
       <Image 
         src={property.images[currentImageIndex] || property.images[0]}
         alt={property.title}
         fill
         className="object-contain"
         quality={100}
       />
     </div>
     
     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-medium tracking-widest text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
       {currentImageIndex + 1} / {property.images.length}
     </div>
   </div>
 )}
 </>
 )}

 </div>
 );
}
