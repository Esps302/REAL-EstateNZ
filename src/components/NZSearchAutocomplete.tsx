"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, X, ArrowRight, Building } from "lucide-react";

export interface NZLocation {
  name: string;
  region: string;
  type: "City" | "Suburb" | "Region";
}

export const POPULAR_NZ_LOCATIONS: NZLocation[] = [
  // Major Cities
  { name: "Auckland", region: "Auckland", type: "City" },
  { name: "Wellington", region: "Wellington", type: "City" },
  { name: "Christchurch", region: "Canterbury", type: "City" },
  { name: "Queenstown", region: "Otago", type: "City" },
  { name: "Tauranga", region: "Bay of Plenty", type: "City" },
  { name: "Hamilton", region: "Waikato", type: "City" },
  { name: "Dunedin", region: "Otago", type: "City" },
  { name: "Napier", region: "Hawke's Bay", type: "City" },
  { name: "Nelson", region: "Nelson Tasman", type: "City" },

  // Auckland Suburbs
  { name: "Auckland CBD", region: "Auckland", type: "Suburb" },
  { name: "Takapuna", region: "Auckland (North Shore)", type: "Suburb" },
  { name: "Ponsonby", region: "Auckland", type: "Suburb" },
  { name: "Remuera", region: "Auckland", type: "Suburb" },
  { name: "Devonport", region: "Auckland (North Shore)", type: "Suburb" },
  { name: "Grey Lynn", region: "Auckland", type: "Suburb" },
  { name: "Mount Eden", region: "Auckland", type: "Suburb" },
  { name: "Epsom", region: "Auckland", type: "Suburb" },
  { name: "Albany", region: "Auckland (North Shore)", type: "Suburb" },
  { name: "Mission Bay", region: "Auckland", type: "Suburb" },
  { name: "Manukau", region: "Auckland", type: "Suburb" },

  // Wellington Suburbs
  { name: "Wellington Central", region: "Wellington", type: "Suburb" },
  { name: "Oriental Bay", region: "Wellington", type: "Suburb" },
  { name: "Te Aro", region: "Wellington", type: "Suburb" },
  { name: "Thorndon", region: "Wellington", type: "Suburb" },
  { name: "Kelburn", region: "Wellington", type: "Suburb" },
  { name: "Lower Hutt", region: "Wellington", type: "Suburb" },

  // Christchurch Suburbs
  { name: "Fendalton", region: "Canterbury", type: "Suburb" },
  { name: "Merivale", region: "Canterbury", type: "Suburb" },
  { name: "Cashmere", region: "Canterbury", type: "Suburb" },
  { name: "Riccarton", region: "Canterbury", type: "Suburb" },
  { name: "Sumner", region: "Canterbury", type: "Suburb" },

  // Queenstown & Lakes
  { name: "Frankton", region: "Otago", type: "Suburb" },
  { name: "Kelvin Heights", region: "Otago", type: "Suburb" },
  { name: "Arrowtown", region: "Otago", type: "Suburb" },
  { name: "Wanaka", region: "Otago", type: "City" },

  // Tauranga & Mount Maunganui
  { name: "Mount Maunganui", region: "Bay of Plenty", type: "Suburb" },
  { name: "Papamoa", region: "Bay of Plenty", type: "Suburb" },
];

interface NZSearchAutocompleteProps {
  initialValue?: string;
  onSelect?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function NZSearchAutocomplete({
  initialValue = "",
  onSelect,
  placeholder = "Search Auckland, Queenstown, Takapuna, Wellington...",
  className = "",
}: NZSearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter locations based on query
  const filteredLocations = query.trim()
    ? POPULAR_NZ_LOCATIONS.filter(
        (loc) =>
          loc.name.toLowerCase().includes(query.toLowerCase()) ||
          loc.region.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : POPULAR_NZ_LOCATIONS.slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (locationName: string) => {
    setQuery(locationName);
    setIsOpen(false);
    if (onSelect) {
      onSelect(locationName);
    } else {
      router.push(`/search?query=${encodeURIComponent(locationName)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (selectedIndex >= 0 && selectedIndex < filteredLocations.length) {
      handleSelectLocation(filteredLocations[selectedIndex].name);
    } else if (query.trim()) {
      handleSelectLocation(query.trim());
    } else {
      router.push(`/search`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredLocations.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredLocations.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center w-full bg-white rounded-full p-2 shadow-2xl border border-zinc-200/80 focus-within:border-[var(--color-primary)] transition-all">
        <div className="flex-1 flex items-center px-4">
          <MapPin className="w-5 h-5 text-zinc-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent border-none focus:outline-none text-zinc-900 placeholder:text-zinc-400 font-medium h-12 text-sm md:text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="text-zinc-400 hover:text-zinc-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white h-12 px-6 md:px-8 rounded-full font-bold flex items-center justify-center transition-colors flex-shrink-0 gap-2 shadow-sm"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-50 animate-in fade-in-50 duration-150">
          <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <span>{query.trim() ? "Matching NZ Locations" : "Popular Destinations"}</span>
            <span className="text-[10px] text-zinc-400 lowercase font-normal">New Zealand</span>
          </div>

          <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto">
            {filteredLocations.map((loc, idx) => {
              const isHighlighted = idx === selectedIndex;
              return (
                <button
                  key={`${loc.name}-${loc.region}`}
                  type="button"
                  onClick={() => handleSelectLocation(loc.name)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                    isHighlighted ? "bg-zinc-100 text-[var(--color-primary)]" : "hover:bg-zinc-50 text-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-500">
                      {loc.type === "City" ? <Building className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-900">{loc.name}</div>
                      <div className="text-xs text-zinc-500">{loc.region}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                      {loc.type}
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-400" />
                  </div>
                </button>
              );
            })}

            {filteredLocations.length === 0 && (
              <div className="p-4 text-center text-sm text-zinc-500">
                No predefined suburb matched &quot;{query}&quot;. Press Search to scan all properties.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
