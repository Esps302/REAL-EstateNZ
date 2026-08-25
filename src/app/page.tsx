"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, MapPin, ShieldCheck, Gem, Star, ArrowRight, Building2, TrendingUp } from "lucide-react";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AgentModal from "@/components/AgentModal";
import { motion } from "framer-motion";
import LeadGenForm from "@/components/LeadGenForm";
import PropertyCard from "@/components/PropertyCard";
import { Property } from "@/types";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Query approved properties without orderBy to avoid missing index errors
        const q = query(
          collection(db, "properties"),
          where("status", "==", "approved"),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const props: Property[] = [];
        snapshot.forEach(doc => {
          props.push({ id: doc.id, ...doc.data() } as Property);
        });
        
        // Sort by createdAt descending on the client
        props.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        // Take top 3
        setFeaturedProperties(props.slice(0, 3));
      } catch (error) {
        console.error("Error fetching featured properties:", error);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/search`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* 1. Hero Section (Cinematic & Lead Gen Focused) */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/90 via-[#0f172a]/70 to-transparent z-10" />
          <Image 
            src="/hero.png" 
            alt="Luxury New Zealand Real Estate" 
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        
        <div className="relative z-20 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold tracking-widest uppercase mb-8">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse"></span>
                Welcome to Heaven Bricks
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-[1.1]">
                A Higher Standard of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-yellow-300">Real Estate.</span>
              </h1>
              
              <p className="text-lg md:text-2xl text-zinc-300 font-light mb-12 max-w-2xl leading-relaxed">
                Discover New Zealand's most exclusive properties with the trusted digital brokerage designed for extraordinary living.
              </p>

              {/* Minimalist Search Pill */}
              <form onSubmit={handleSearch} className="flex items-center w-full max-w-2xl bg-white rounded-full p-2 shadow-2xl">
                <div className="flex-1 flex items-center px-4">
                  <MapPin className="w-5 h-5 text-zinc-400 mr-3" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by city, suburb, or keyword..."
                    className="w-full bg-transparent border-none focus:outline-none text-zinc-900 placeholder:text-zinc-400 font-medium h-12"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white h-12 px-8 rounded-full font-bold flex items-center justify-center transition-colors"
                >
                  Search
                </button>
              </form>

              <div className="mt-8 flex gap-6 text-sm font-medium text-white/80">
                <button onClick={() => router.push('/search?type=buy')} className="hover:text-white transition-colors">Browse Homes for Sale &rarr;</button>
                <button onClick={() => setIsAgentModalOpen(true)} className="hover:text-white transition-colors">Find a Top Agent &rarr;</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Featured Properties Section */}
      <section className="py-12 md:py-16 bg-white relative">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-primary-dark)] tracking-tight mb-2">
                Exclusive Listings
              </h2>
              <p className="text-zinc-500 text-base max-w-2xl">
                Explore a hand-picked selection of our most extraordinary properties.
              </p>
            </div>
            <button 
              onClick={() => router.push('/search')}
              className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-sm hover:text-[var(--color-primary-dark)] transition-colors group"
            >
              View all properties <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-zinc-100 rounded-2xl h-[380px]"></div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-50 rounded-3xl border border-zinc-200">
              <p className="text-zinc-500 font-medium">More exclusive listings coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Lead Generation VIP Section (Split Layout) */}
      <section className="py-12 md:py-16 bg-zinc-50 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--color-secondary-light)]/10 to-transparent rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Left Content */}
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 mb-4 rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-black uppercase tracking-widest text-[10px]">
                VIP Buyer Network
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-primary-dark)] mb-4 leading-tight tracking-tight">
                Gain the competitive edge.
              </h2>
              <p className="text-base text-zinc-600 mb-6 leading-relaxed">
                Whether purchasing your dream home or seeking a confidential appraisal, Heaven Bricks gives you unparalleled access to off-market opportunities and expert advice.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-[var(--color-primary)]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 mb-0.5">Accurate Market Appraisals</h4>
                    <p className="text-sm text-zinc-500">Get a data-driven, confidential valuation from our experts.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-[var(--color-primary)]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 mb-0.5">Off-Market Access</h4>
                    <p className="text-sm text-zinc-500">View extraordinary homes before they are publicly listed.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right Form */}
            <div className="relative lg:pl-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-[40px] transform rotate-3 scale-105"></div>
              <LeadGenForm />
            </div>

          </div>
        </div>
      </section>

      {/* 4. Trust & Authority Section */}
      <section className="py-12 md:py-16 bg-white border-t border-zinc-200">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--color-primary-dark)] mb-3">The Heaven Bricks Standard</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto text-base">Uncompromising quality and absolute transparency.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-14 h-14 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:border-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)]/5">
                <ShieldCheck className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">Verified Authenticity</h3>
              <p className="text-zinc-600 text-sm leading-relaxed max-w-sm mx-auto">Every listing undergoes rigorous verification to guarantee accuracy and build absolute trust.</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:border-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)]/5">
                <Gem className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">Curated Selection</h3>
              <p className="text-zinc-600 text-sm leading-relaxed max-w-sm mx-auto">Our platform is designed for exclusivity, featuring only the finest homes across New Zealand.</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:border-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)]/5">
                <Star className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">Elite Network</h3>
              <p className="text-zinc-600 text-sm leading-relaxed max-w-sm mx-auto">Connect directly with the highest-rated, most distinguished real estate professionals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Prime Destinations */}
      <section className="py-12 md:py-16 bg-[#0f172a] text-white">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Prime Destinations</h2>
              <p className="text-zinc-400 text-sm">Explore the most sought-after regions in New Zealand.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Auckland", image: "/auckland.png" },
              { name: "Wellington", image: "/wellington.png" },
              { name: "Christchurch", image: "/christchurch.png" },
              { name: "Queenstown", image: "/queenstown.png" }
            ].map((city) => (
              <div 
                key={city.name} 
                onClick={() => router.push(`/search?query=${city.name}`)}
                className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-square shadow-xl flex flex-col justify-end p-5 transition-all hover:ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-zinc-900"
              >
                <Image src={city.image} alt={city.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="relative z-10">
                  <h3 className="text-xl font-extrabold tracking-tight mb-1">{city.name}</h3>
                  <div className="flex items-center text-[var(--color-accent)] font-bold text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AgentModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} />
    </div>
  );
}
