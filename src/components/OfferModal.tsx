"use client";

import React from "react";
import { X } from "lucide-react";
import { Property } from "@/types";
import { OfferForm } from "./forms/OfferForm";

interface OfferModalProps {
 property: Property;
 isOpen: boolean;
 onClose: () => void;
}

export function OfferModal({ property, isOpen, onClose }: OfferModalProps) {
 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
 <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 flex flex-col relative custom-scrollbar">
 
 {/* Header */}
 <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-zinc-100 flex items-center justify-between z-10">
 <div>
 <h2 className="text-xl font-extrabold text-zinc-900">Make an Offer</h2>
 <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{property.title}</p>
 </div>
 <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 <div className="p-6">
 <OfferForm property={property} onSuccess={() => {
 // Optional: Close modal after a delay, or let the form show its success state
 }} />
 </div>
 </div>
 </div>
 );
}
