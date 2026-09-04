import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, MapPin, Bed, Bath, Square, CheckCircle2, DollarSign, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/utils/formatCurrency";

interface AdminPropertyPreviewModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export default function AdminPropertyPreviewModal({ property, isOpen, onClose, onApprove, onReject }: AdminPropertyPreviewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !property) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50/50">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" /> 
                Property Review Preview
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">ID: {property.id}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Images */}
              <div className="space-y-4">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                  {property.images && property.images.length > 0 ? (
                    <Image 
                      src={property.images[currentImageIndex]} 
                      alt="Property Preview" 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <span>No images provided</span>
                    </div>
                  )}
                  {property.images && property.images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                      {currentImageIndex + 1} / {property.images.length}
                    </div>
                  )}
                </div>
                
                {property.images && property.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {property.images.map((img: string, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${currentImageIndex === idx ? 'border-blue-600' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      >
                        <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-xs font-bold rounded uppercase tracking-wider">
                      {property.listingType}
                    </span>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold rounded uppercase tracking-wider">
                      {property.propertyType}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded uppercase tracking-wider ${property.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : property.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                      {property.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 leading-tight mb-2">{property.title}</h3>
                  <p className="flex items-start gap-1.5 text-sm text-zinc-600 font-medium">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    {property.address ? `${property.address}, ` : ''}{property.suburb}, {property.city}
                  </p>
                </div>

                {/* Pricing Box (Admin Eyes Only) */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> Pricing Details (Admin View)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Public Asking Price</p>
                      <p className="text-lg font-extrabold text-zinc-900">{formatCurrency(property.price, property.currency)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Confidential Reserve Price</p>
                      <p className="text-lg font-extrabold text-rose-600">
                        {property.reservePrice ? formatCurrency(property.reservePrice, property.currency) : "Not Set"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 flex flex-col items-center justify-center">
                    <Bed className="w-5 h-5 text-zinc-400 mb-1" />
                    <span className="font-bold text-zinc-900">{property.bedrooms}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">Beds</span>
                  </div>
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 flex flex-col items-center justify-center">
                    <Bath className="w-5 h-5 text-zinc-400 mb-1" />
                    <span className="font-bold text-zinc-900">{property.bathrooms}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">Baths</span>
                  </div>
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 flex flex-col items-center justify-center">
                    <Square className="w-5 h-5 text-zinc-400 mb-1" />
                    <span className="font-bold text-zinc-900">{property.area}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">SQM</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-zinc-900 mb-2">Description</h4>
                  <p className="text-sm text-zinc-600 bg-zinc-50 p-4 rounded-xl border border-zinc-100 h-32 overflow-y-auto scrollbar-thin whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>
                
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {property.amenities.map((amenity: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-md border border-zinc-200">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Close Preview
            </button>
            {property.status !== 'rejected' && onReject && (
              <button 
                onClick={() => { onReject(); onClose(); }}
                className="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
              >
                Reject Listing
              </button>
            )}
            {property.status !== 'approved' && onApprove && (
              <button 
                onClick={() => { onApprove(); onClose(); }}
                className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Publish
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
