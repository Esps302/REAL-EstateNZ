"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { awardCredits } from "@/lib/wallet";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Property } from "@/types";
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";

interface OfferFormProps {
 property: Property;
 onSuccess?: () => void;
}

export function OfferForm({ property, onSuccess }: OfferFormProps) {
 const { user, userData } = useAuth();
 const [offerPrice, setOfferPrice] = useState("");
 const [moveInDate, setMoveInDate] = useState("");
 const [paymentType, setPaymentType] = useState<"Cash" | "Mortgage">("Mortgage");
 const [notes, setNotes] = useState("");
 const [phone, setPhone] = useState(userData?.phone || "");
 const [expiryDays, setExpiryDays] = useState("3");
 
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState(false);

  // Instant Real-Time Smart Match Calculation
  const calculateMatch = (offerAmount: number) => {
    if (!offerAmount || offerAmount <= 0) return null;
    
    const target = (property as any).reservePrice || property.price;
    if (!target) return null;

    let matchCategory = '';
    let colorClass = '';

    if (offerAmount >= target) {
      matchCategory = 'Excellent Match';
      colorClass = 'text-green-600 bg-green-50 border-green-200';
    } else if (offerAmount >= target * 0.95) {
      matchCategory = 'Strong Match';
      colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    } else if (offerAmount >= target * 0.90) {
      matchCategory = 'Good Match';
      colorClass = 'text-yellow-600 bg-yellow-50 border-yellow-200';
    } else if (offerAmount >= target * 0.85) {
      matchCategory = 'Moderate Match';
      colorClass = 'text-orange-600 bg-orange-50 border-orange-200';
    } else {
      matchCategory = 'Low Match';
      colorClass = 'text-red-600 bg-red-50 border-red-200';
    }

    return { text: matchCategory, colorClass };
  };

  const matchIndicator = calculateMatch(Number(offerPrice));
  const isMatching = false;

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!user || !userData) {
 setError("You must be logged in to make an offer.");
 return;
 }

 setSubmitting(true);
 setError("");

 try {
 const expiresAt = Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000;
 const moveInTimestamp = moveInDate ? new Date(moveInDate).getTime() : null;

 // 1. Save to Firestore
 await addDoc(collection(db, "offers"), {
 propertyId: property.id,
 propertyTitle: property.title,
 buyerId: user.uid,
 buyerPhone: phone,
 sellerId: property.ownerId, // For admin routing
 offerPrice: Number(offerPrice),
 moveInDate: moveInTimestamp,
 paymentType,
 notes,
 status: "pending",
 createdAt: Date.now(),
 expiresAt
 });

 // 2. Send Automated Email to Buyer
  try {
    await sendNotificationEmail({
      to: userData.email,
      templateType: 'offerSubmitted',
      payload: { 
        userName: userData.name, 
        propertyTitle: property.title, 
        offerAmount: Number(offerPrice) 
      }
    });
  } catch (emailErr) {
    console.error("Failed to send offer confirmation email", emailErr);
  }

 // 3. Send In-App Admin Notification
 await addDoc(collection(db, "notifications"), {
   userId: "admin_system",
   title: `New Offer: ${userData.name}`,
   message: `${userData.name} (Ph: ${userData.phone || 'N/A'}) submitted an offer of $${Number(offerPrice).toLocaleString()} on ${property.title}.`,
   type: "info",
   isRead: false,
   isPoppedUp: false,
   link: "/admin/offers",
   createdAt: Date.now()
 }).catch(err => console.error("Failed to create admin notification", err));

 // Award credits for placing an offer
 if (user?.uid) {
   await awardCredits(user.uid, 100, "Placed an Offer on a Property");
 }

 setSuccess(true);
 if (onSuccess) onSuccess();
 } catch (err: any) {
 setError(err.message || "Failed to submit offer.");
 setSubmitting(false);
 }
 };

 if (success) {
 return (
 <div className="bg-white rounded-3xl p-8 w-full text-center border border-zinc-200">
 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <ShieldCheck className="w-8 h-8 text-green-600" />
 </div>
 <h2 className="text-2xl font-bold text-zinc-900 mb-2">Offer Submitted securely!</h2>
 <p className="text-zinc-600 text-sm">Your confidential offer has been lodged with our brokerage team. We will review it against the seller's expectations and notify you soon.</p>
 </div>
 );
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-5">
 {error && <div className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
 
 {/* Price & Smart Match */}
 <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl">
 <label className="block text-sm font-bold text-zinc-900 mb-2">Maximum Willing To Pay ($)</label>
 <input 
 type="number" 
 required 
 value={offerPrice} 
 onChange={e => setOfferPrice(e.target.value)} 
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 }
 }}
 placeholder="e.g. 850000" 
 className="w-full text-2xl font-extrabold px-4 py-3 rounded-xl border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 shadow-sm" 
 />
 
 <div className="mt-4 pt-4 border-t border-zinc-200">
 <div className="flex items-center justify-between mb-2">
 <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">Smart Match Indicator</label>
 {isMatching && <span className="text-xs font-medium text-zinc-400 animate-pulse">Analyzing...</span>}
 </div>
 
 {matchIndicator ? (
 <div className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-500 ${matchIndicator.colorClass} ${isMatching ? 'opacity-50' : 'opacity-100 scale-100'}`}>
 <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-current to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
 <div className="flex items-center justify-between relative z-10">
 <div className="flex items-center gap-3">
 <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
 <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current"></div>
 <div className="w-3 h-3 rounded-full bg-current"></div>
 </div>
 <div>
 <div className="font-extrabold text-base tracking-tight">{matchIndicator.text}</div>
 <div className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">Probability Score</div>
 </div>
 </div>
 </div>
 </div>
 ) : (
 <div className="px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400 font-medium text-sm flex items-center gap-2 shadow-inner">
 <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
 Enter an amount to see negotiation probability
 </div>
 )}
 <p className="text-[10px] text-zinc-400 mt-1.5 font-medium leading-tight">
 This indicator uses an algorithm to compare your maximum price with the seller's confidential reserve price.
 </p>
 </div>
 </div>

 {/* Logistics */}
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold text-zinc-900 mb-2">Payment Strategy</label>
 <select required value={paymentType} onChange={(e: any) => setPaymentType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-semibold text-zinc-900 text-sm">
 <option value="Mortgage">Need a Mortgage</option>
 <option value="Cash">Cash Buyer</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-bold text-zinc-900 mb-2">Offer Expiry</label>
 <select required value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-semibold text-zinc-900 text-sm">
 <option value="1">24 Hours</option>
 <option value="3">3 Days</option>
 <option value="7">7 Days</option>
 </select>
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-zinc-900 mb-2">Phone Number</label>
 <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 021 123 4567" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-semibold text-zinc-900 text-sm" />
 </div>

 <div>
 <label className="block text-sm font-bold text-zinc-900 mb-2">Preferred Move-in Date (Optional)</label>
 <input type="date" value={moveInDate} onChange={e => setMoveInDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-semibold text-zinc-900 text-sm" />
 </div>

 <div>
 <label className="block text-sm font-bold text-zinc-900 mb-2">Additional Notes (Optional)</label>
 <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special conditions for the brokerage team..." rows={3} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium text-zinc-900 text-sm resize-none custom-scrollbar"></textarea>
 </div>

 <button type="submit" disabled={submitting || !offerPrice || Number(offerPrice) <= 0} className="w-full py-4 mt-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl font-bold text-base transition-colors shadow-lg flex items-center justify-center gap-2">
 {submitting ? "Submitting..." : "Submit Offer"}
 </button>
 </form>
 );
}
