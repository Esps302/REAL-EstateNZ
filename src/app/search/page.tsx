"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Filter, SlidersHorizontal, Bed, Bath, Square, CheckCircle2, Heart, X, Sparkles, ChevronDown, ShieldCheck, UserCircle, ChevronRight, Phone } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { nzLocations } from "@/lib/nzLocations";
import { Property } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import AgentModal from "@/components/AgentModal";

import PropertyCard from "@/components/PropertyCard";
import { Suspense } from "react";

const Map = dynamic(() => import('@/components/Map'), { 
 ssr: false, 
 loading: () => <div className="w-full h-full bg-zinc-200 animate-pulse rounded-2xl border border-zinc-200 shadow-inner"></div> 
});

export default function SearchPage() {
 return (
 <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div></div>}>
 <SearchPageContent />
 </Suspense>
 );
}

function SearchPageContent() {
 const searchParams = useSearchParams();
 const typeParam = searchParams.get('type');
 const queryParam = searchParams.get('query');
 const regionParam = searchParams.get('region');
 const districtParam = searchParams.get('district');
 const suburbParam = searchParams.get('suburb');
 
 const isRentParam = typeParam === 'rent';
 
 const [properties, setProperties] = useState<Property[]>([]);
 const [loading, setLoading] = useState(true);
 const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
 
 // Filters State
 const [listingType, setListingType] = useState<"buy" | "rent">(isRentParam ? "rent" : "buy");
 const [searchTerm, setSearchTerm] = useState(queryParam || "");
 const [priceRange, setPriceRange] = useState("any");
 const [beds, setBeds] = useState("any");
 const [baths, setBaths] = useState("any");
 const [parking, setParking] = useState("any");
 const [propertyType, setPropertyType] = useState("any");
 
 // UI State
 const [showMobileFilters, setShowMobileFilters] = useState(false);
 const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
 
 // TradeMe Dropdown State
 const [location, setLocation] = useState(regionParam || "All New Zealand");
 const [district, setDistrict] = useState(districtParam || "All districts");
 const [suburb, setSuburb] = useState(suburbParam || "All suburbs");
 
  // Pagination State
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

 useEffect(() => {
 const fetchProperties = async () => {
 setLoading(true);
 try {
 const q = query(collection(db, "properties"));
 const snapshot = await getDocs(q);
 let props: Property[] = [];
 snapshot.forEach((doc) => {
 const data = doc.data();
 if (data.status === "approved") {
 props.push({ id: doc.id, ...data } as Property);
 }
 });
 
        // Sort logic: Featured -> Premium -> Basic, then by Newest
        const getPlanWeight = (plan?: string) => {
          if (plan === "Featured") return 3;
          if (plan === "Premium") return 2;
          return 1; // Basic or undefined
        };

        props.sort((a, b) => {
          const weightA = getPlanWeight(a.plan);
          const weightB = getPlanWeight(b.plan);
          if (weightA !== weightB) {
            return weightB - weightA;
          }
          return (b.createdAt || 0) - (a.createdAt || 0);
        });
        
        setProperties(props);
 } catch (error) {
 console.error("Error fetching properties:", error);
 } finally {
 setLoading(false);
 }
 };

 fetchProperties();
 }, []);

 // Update state when URL parameters change
 useEffect(() => {
 if (typeParam === 'rent') {
 setListingType('rent');
 } else if (typeParam === 'buy') {
 setListingType('buy');
 }
 if (queryParam !== null) {
 setSearchTerm(queryParam);
 }
 if (regionParam) setLocation(regionParam);
 if (districtParam) setDistrict(districtParam);
 if (suburbParam) setSuburb(suburbParam);
 }, [typeParam, queryParam, regionParam, districtParam, suburbParam]);

  // Reset pagination when filters change
  useEffect(() => {
  setCurrentPage(1);
  }, [listingType, searchTerm, priceRange, beds, baths, parking, propertyType, location, district, suburb]);

 // Client-side filtering
 const filteredProperties = properties.filter(p => {
 if ((listingType === 'buy' && p.listingType !== 'For Sale') || (listingType === 'rent' && p.listingType !== 'For Rent')) return false;
 
 if (location !== "All New Zealand" && p.region !== location && p.city !== location) return false;
 if (district !== "All districts" && p.district !== district && p.city !== district) return false;
 if (suburb !== "All suburbs" && p.suburb !== suburb) return false;

 if (searchTerm) {
 const term = searchTerm.toLowerCase();
 const match = p.title.toLowerCase().includes(term) || 
 p.city.toLowerCase().includes(term) || 
 p.suburb.toLowerCase().includes(term);
 if (!match) return false;
 }
 if (priceRange !== "any") {
 if (listingType === 'buy') {
 if (priceRange === "0-500k" && p.price > 500000) return false;
 if (priceRange === "500k-1m" && (p.price <= 500000 || p.price > 1000000)) return false;
 if (priceRange === "1m+" && p.price <= 1000000) return false;
 } else {
 if (priceRange === "0-500" && p.price > 500) return false;
 if (priceRange === "500-1000" && (p.price <= 500 || p.price > 1000)) return false;
 if (priceRange === "1000+" && p.price <= 1000) return false;
 }
 }
    if (beds !== "any") {
      const minBeds = parseInt(beds.replace('+', ''));
      if (p.bedrooms < minBeds) return false;
    }
    if (baths !== "any") {
      const minBaths = parseInt(baths.replace('+', ''));
      if (p.bathrooms < minBaths) return false;
    }
    if (parking !== "any") {
      const minParking = parseInt(parking.replace('+', ''));
      if ((p.parkingSpaces || 0) < minParking) return false;
    }
    if (propertyType !== "any" && p.propertyType !== propertyType) {
      return false;
    }
    return true;
 });

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const displayedProperties = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

 const FilterControls = () => (
 <>
 <div className="flex flex-col md:flex-row gap-4 w-full">
 <select 
 value={listingType} 
 onChange={(e) => setListingType(e.target.value as "buy" | "rent")}
 className="border border-zinc-300 rounded-xl px-4 py-3 md:py-2 bg-white text-sm text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm cursor-pointer w-full md:w-auto"
 >
 <option value="buy">Buy</option>
 <option value="rent">Rent</option>
 </select>
 <select 
 value={priceRange}
 onChange={(e) => setPriceRange(e.target.value)}
 className="border border-zinc-300 rounded-xl px-4 py-3 md:py-2 bg-white text-sm text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm cursor-pointer w-full md:w-auto"
 >
 <option value="any">Any Price</option>
 {listingType === 'buy' ? (
 <>
 <option value="0-500k">$0 - $500k</option>
 <option value="500k-1m">$500k - $1M</option>
 <option value="1m+">$1M+</option>
 </>
 ) : (
 <>
 <option value="0-500">$0 - $500 / week</option>
 <option value="500-1000">$500 - $1,000 / week</option>
 <option value="1000+">$1,000+ / week</option>
 </>
 )}
 </select>
 <select 
 value={beds}
 onChange={(e) => setBeds(e.target.value)}
 className="border border-zinc-300 rounded-xl px-4 py-3 md:py-2 bg-white text-sm text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm cursor-pointer w-full md:w-auto"
 >
 <option value="any">Beds & Baths</option>
 <option value="2+">2+ Beds</option>
 <option value="3+">3+ Beds</option>
 <option value="4+">4+ Beds</option>
 </select>
 <select 
 value={baths}
 onChange={(e) => setBaths(e.target.value)}
 className="border border-zinc-300 rounded-xl px-4 py-3 md:py-2 bg-white text-sm text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm cursor-pointer w-full md:w-auto"
 >
 <option value="any">Any Baths</option>
 <option value="1+">1+ Baths</option>
 <option value="2+">2+ Baths</option>
 <option value="3+">3+ Baths</option>
 </select>
 <select 
 value={parking}
 onChange={(e) => setParking(e.target.value)}
 className="border border-zinc-300 rounded-xl px-4 py-3 md:py-2 bg-white text-sm text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm cursor-pointer w-full md:w-auto"
 >
 <option value="any">Any Parking</option>
 <option value="1+">1+ Spaces</option>
 <option value="2+">2+ Spaces</option>
 <option value="3+">3+ Spaces</option>
 </select>
 <select 
 value={propertyType}
 onChange={(e) => setPropertyType(e.target.value)}
 className="border border-zinc-300 rounded-xl px-4 py-3 md:py-2 bg-white text-sm text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm cursor-pointer w-full md:w-auto"
 >
 <option value="any">Any Type</option>
 <option value="House">House</option>
 <option value="Apartment">Apartment</option>
 <option value="Townhouse">Townhouse</option>
 <option value="Villa">Villa</option>
 <option value="Commercial">Commercial</option>
 </select>
 </div>
 <button 
 onClick={() => { setSearchTerm(""); setPriceRange("any"); setBeds("any"); setBaths("any"); setParking("any"); setPropertyType("any"); setShowMobileFilters(false); }}
 className="mt-6 md:hidden bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold py-3 px-8 rounded-xl transition-colors w-full"
 >
 Clear Filters
 </button>
 <button 
 onClick={() => setShowMobileFilters(false)}
 className="mt-3 md:hidden bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-8 rounded-xl transition-colors w-full shadow-lg"
 >
 Show {filteredProperties.length} Results
 </button>
 </>
 );

 return (
 <div className="flex flex-col min-h-screen bg-zinc-50 font-sans">
 


 {/* TradeMe Style Search Header */}
 <div className="w-full bg-white pt-8 pb-10 shadow-sm z-40 relative border-b border-zinc-200">
 <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
 
 <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 mb-6 tracking-tight">
 Search New Zealand's largest range of properties
 </h1>



 <div className="flex flex-col xl:flex-row gap-4 items-center">
 {/* Search Bar Container */}
 <div className="flex-1 w-full flex flex-col md:flex-row border border-zinc-300 rounded overflow-hidden">
 <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-300">
 
 {/* Free Text Input (Region) */}
 <div className="relative bg-white cursor-pointer hover:bg-zinc-50 flex-1 border-b md:border-b-0">
 <select 
 value={location} 
 onChange={e => {
 setLocation(e.target.value);
 setDistrict("All districts");
 setSuburb("All suburbs");
 }} 
 className="w-full appearance-none bg-transparent py-2.5 pl-4 pr-10 text-zinc-900 font-medium cursor-pointer focus:outline-none"
 >
 <option>All New Zealand</option>
 {Object.keys(nzLocations).map(region => (
 <option key={region} value={region}>{region}</option>
 ))}
 </select>
 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
 </div>

 {/* Dropdown 2 */}
 <div className="relative bg-white cursor-pointer hover:bg-zinc-50 flex-1 border-b md:border-b-0">
 <select 
 value={district} 
 onChange={e => {
 setDistrict(e.target.value);
 setSuburb("All suburbs");
 }} 
 disabled={location === "All New Zealand"}
 className="w-full appearance-none bg-transparent py-2.5 pl-4 pr-10 text-zinc-600 font-medium cursor-pointer focus:outline-none disabled:opacity-50"
 >
 <option>All districts</option>
 {location !== "All New Zealand" && Object.keys(nzLocations[location] || {}).map(dist => (
 <option key={dist} value={dist}>{dist}</option>
 ))}
 </select>
 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
 </div>

 {/* Dropdown 3 */}
 <div className="relative bg-white cursor-pointer hover:bg-zinc-50 flex-1 border-b md:border-b-0">
 <select 
 value={suburb} 
 onChange={e => setSuburb(e.target.value)} 
 disabled={district === "All districts"}
 className="w-full appearance-none bg-transparent py-2.5 pl-4 pr-10 text-zinc-600 font-medium cursor-pointer focus:outline-none disabled:opacity-50"
 >
 <option>All suburbs</option>
 {location !== "All New Zealand" && district !== "All districts" && (nzLocations[location]?.[district] || []).map((sub: string) => (
 <option key={sub} value={sub}>{sub}</option>
 ))}
 </select>
 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
 </div>
 </div>
 
 {/* Submit Button */}
 <button className="bg-[#0073e6] hover:bg-[#005bb5] text-white font-bold px-12 py-2.5 flex items-center justify-center transition-colors">
 Search
 </button>
 </div>

 {/* Desktop Filters (Beds & Price) */}
 <div className="hidden xl:flex gap-2">
 <select 
 value={priceRange}
 onChange={(e) => setPriceRange(e.target.value)}
 className="border border-zinc-300 px-4 py-2.5 bg-white text-sm text-zinc-900 font-bold focus:outline-none cursor-pointer"
 >
 <option value="any">Any Price</option>
 <option value="0-500k">$0 - $500k</option>
 <option value="500k-1m">$500k - $1M</option>
 <option value="1m+">$1M+</option>
 </select>
 <select 
 value={beds}
 onChange={(e) => setBeds(e.target.value)}
 className="border border-zinc-300 px-4 py-2.5 bg-white text-sm text-zinc-900 font-bold focus:outline-none cursor-pointer"
 >
 <option value="any">Beds & Baths</option>
 <option value="2+">2+ Beds</option>
 <option value="3+">3+ Beds</option>
 </select>
 <select 
 value={baths}
 onChange={(e) => setBaths(e.target.value)}
 className="border border-zinc-300 px-4 py-2.5 bg-white text-sm text-zinc-900 font-bold focus:outline-none cursor-pointer"
 >
 <option value="any">Any Baths</option>
 <option value="1+">1+ Baths</option>
 <option value="2+">2+ Baths</option>
 </select>
 <select 
 value={propertyType}
 onChange={(e) => setPropertyType(e.target.value)}
 className="border border-zinc-300 px-4 py-2.5 bg-white text-sm text-zinc-900 font-bold focus:outline-none cursor-pointer"
 >
 <option value="any">Property Type</option>
 <option value="House">House</option>
 <option value="Apartment">Apartment</option>
 <option value="Townhouse">Townhouse</option>
 <option value="Commercial">Commercial</option>
 </select>
 </div>

 {/* Mobile Filters Trigger */}
 <button 
 onClick={() => setShowMobileFilters(true)}
 className="xl:hidden w-full md:w-auto flex items-center justify-center gap-2 border border-zinc-300 bg-zinc-900 text-white rounded px-5 py-4 text-sm font-bold shadow-md hover:bg-zinc-800 transition-colors"
 >
 <SlidersHorizontal className="w-4 h-4" /> Filters
 </button>
 </div>
 </div>
 </div>

 {/* Mobile Filters Bottom Sheet */}
 <AnimatePresence>
 {showMobileFilters && (
 <>
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black/60 z-[100] md:hidden backdrop-blur-sm"
 onClick={() => setShowMobileFilters(false)}
 />
 <motion.div 
 initial={{ y: "100%" }}
 animate={{ y: 0 }}
 exit={{ y: "100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 200 }}
 className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[101] md:hidden p-6 shadow-2xl border-t border-zinc-200 max-h-[85vh] overflow-y-auto"
 >
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-xl font-extrabold text-zinc-900">Filters</h3>
 <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-zinc-100 rounded-full text-zinc-600 hover:text-zinc-900">
 <X className="w-5 h-5" />
 </button>
 </div>
 <FilterControls />
 </motion.div>
 </>
 )}
 </AnimatePresence>

 {/* Split Screen Content Layout */}
 <div className="flex-grow w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row relative">
 
 {/* Properties List (Left Side) */}
 <div className="w-full lg:w-[65%] xl:w-[70%] px-4 sm:px-6 lg:px-8 py-8">
 <div className="flex justify-between items-end mb-8">
 <div>
 <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
 {listingType === 'rent' ? "Properties for Rent" : "Real Estate & Homes for Sale"}
 </h1>
 <p className="text-zinc-500 font-medium mt-1">Showing {filteredProperties.length} results</p>
 </div>
 </div>

 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
 {[1, 2, 3, 4, 5, 6].map(i => (
 <div key={i} className="animate-pulse bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
 <div className="h-64 bg-zinc-200"></div>
 <div className="p-6 space-y-4">
 <div className="h-6 bg-zinc-200 rounded w-1/3"></div>
 <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
 <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
 </div>
 </div>
 ))}
 </div>
 ) : displayedProperties.length > 0 ? (
 <>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
 {displayedProperties.map((property) => (
 <div 
 key={property.id} 
 onMouseEnter={() => setHoveredPropertyId(property.id)}
 onMouseLeave={() => setHoveredPropertyId(null)}
 >
 <PropertyCard property={property} />
 </div>
 ))}
 </div>
 
  {/* Pagination Controls */}
  {totalPages > 1 && (
    <div className="w-full py-12 flex justify-center items-center gap-2">
      <button 
        onClick={() => {
          setCurrentPage(p => Math.max(1, p - 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-zinc-300 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-zinc-100 transition-colors"
      >
        Previous
      </button>
      
      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
              currentPage === page 
                ? "bg-zinc-900 text-white" 
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button 
        onClick={() => {
          setCurrentPage(p => Math.min(totalPages, p + 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-zinc-300 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-zinc-100 transition-colors"
      >
        Next
      </button>
    </div>
  )}
 </>
 ) : (
 <div className="bg-white rounded-3xl border border-zinc-200 p-16 text-center shadow-sm mt-8">
 <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
 <Search className="w-8 h-8 text-zinc-300" />
 </div>
 <h3 className="text-2xl font-bold text-zinc-900 mb-2">No properties found</h3>
 <p className="text-zinc-500 font-medium mb-6">Try adjusting your filters or search term to find what you're looking for.</p>
 <button 
 onClick={() => { 
   setSearchTerm(""); 
   setPriceRange("any"); 
   setBeds("any"); 
   setBaths("any");
   setParking("any");
   setPropertyType("any");
   setLocation("All New Zealand"); 
   setDistrict("All districts"); 
   setSuburb("All suburbs");
 }}
 className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-8 transition-colors shadow-md"
 >
 Clear Filters
 </button>
 </div>
 )}
 </div>

        {/* Map Container (Right Side) */}
        <div className="hidden lg:block lg:w-[35%] xl:w-[30%] p-4 pl-0 pb-12">
          <div className="sticky top-[80px] flex flex-col gap-4 h-[calc(100vh-100px)] w-full relative">
            
            {/* Map */}
            <div className="flex-1 w-full relative z-0 border border-zinc-300 min-h-[250px]">
              <Map properties={filteredProperties} hoveredPropertyId={hoveredPropertyId} />
            </div>

            {/* Professional Lead Generation Box */}
            <div className="bg-white border border-zinc-300 shadow-md flex-shrink-0 overflow-hidden relative group">
              {/* Decorative top accent */}
              <div className="h-1.5 w-full bg-[#0073e6]"></div>
              
              <div className="p-5 border-b border-zinc-100 bg-gradient-to-b from-white to-zinc-50">
                <div className="flex items-center gap-2 mb-3">
                  <UserCircle className="w-5 h-5 text-[#0073e6]" />
                  <p className="text-xs font-bold text-[#0073e6] uppercase tracking-wider">Expert Advice</p>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-zinc-200 relative">
                    <Image 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256" 
                      alt="Professional Agent"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-zinc-900 leading-tight">Need expert help?</h3>
                    <p className="text-xs text-zinc-600 mt-1">
                      Enter your number and our team will match you with a top agent.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white">
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsAgentModalOpen(true)}
                    className="w-full py-3.5 bg-[#0073e6] hover:bg-[#005bb5] text-white font-bold text-sm transition-colors text-center shadow-md flex justify-center items-center gap-2 rounded-sm"
                  >
                    Find an Agent Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-center gap-2 text-xs font-medium text-zinc-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% free and no obligation</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <AgentModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} />
    </div>
  );
}
