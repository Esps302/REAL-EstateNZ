"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, addDoc } from "firebase/firestore";
import { Offer, Property, User } from "@/types";
import { Handshake, Calendar, CreditCard, Clock, X, Check, Mail, Phone, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";

interface OfferWithProperty extends Offer {
 propertyDetails?: Property;
 buyerDetails?: User;
}

export default function AdminOffersPage() {
 const { user, userData, loading } = useAuth();
 const router = useRouter();
 
 const [offers, setOffers] = useState<OfferWithProperty[]>([]);
 const [fetching, setFetching] = useState(true);

 useEffect(() => {
 if (!loading) {
 if (!user || (userData?.role !== "admin" && userData?.role !== "super_admin")) {
 router.push("/dashboard");
 return;
 }

 const offersRef = collection(db, "offers");
 const q = query(offersRef, orderBy("createdAt", "desc"));
 
 const unsubscribe = onSnapshot(q, async (snapshot) => {
 const offersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OfferWithProperty));
 
 // Fetch associated property + buyer details
 const enrichedOffers = await Promise.all(offersData.map(async (offer) => {
 try {
 const propRef = doc(db, "properties", offer.propertyId);
 const propSnap = await getDoc(propRef);
 if (propSnap.exists()) {
 offer.propertyDetails = propSnap.data() as Property;
 }
 } catch (err) {
 console.error("Failed to fetch property details for offer", err);
 }
 // Fetch buyer user details
 try {
 if (offer.buyerId) {
 const userRef = doc(db, "users", offer.buyerId);
 const userSnap = await getDoc(userRef);
 if (userSnap.exists()) {
 offer.buyerDetails = userSnap.data() as User;
 }
 }
 } catch (err) {
 console.error("Failed to fetch buyer details", err);
 }
 return offer;
 }));

 setOffers(enrichedOffers);
 setFetching(false);
 });

 return () => unsubscribe();
 }
 }, [user, userData, loading, router]);

  const handleUpdateStatus = async (offerId: string, newStatus: string) => {
    try {
      const offerRef = doc(db, "offers", offerId);
      await updateDoc(offerRef, { status: newStatus });
      
      const offer = offers.find(o => o.id === offerId);
      if (offer && offer.buyerId) {
        await addDoc(collection(db, "notifications"), {
          userId: offer.buyerId,
          title: `Offer ${newStatus === 'accepted' ? 'Accepted!' : newStatus === 'rejected' ? 'Rejected' : 'Status Updated'}`,
          message: `Your offer of $${offer.offerPrice.toLocaleString()} for the property ${offer.propertyDetails?.title || ''} has been ${newStatus}.`,
          type: newStatus === 'accepted' ? 'success' : newStatus === 'rejected' ? 'warning' : 'info',
          isRead: false,
          isPoppedUp: false,
          link: `/property/${offer.propertyId}`,
          createdAt: Date.now()
        });

        sendNotificationEmail({
          userId: offer.buyerId,
          to: offer.buyerDetails?.email,
          templateType: "adminNotificationToUser",
          payload: {
            userName: offer.buyerDetails?.name || "Valued Client",
            updateTitle: `Offer ${newStatus === 'accepted' ? 'Accepted!' : newStatus === 'rejected' ? 'Rejected' : 'Status Updated'}`,
            updateMessage: `Your offer of $${offer.offerPrice.toLocaleString()} for the property ${offer.propertyDetails?.title || ''} has been ${newStatus}.`,
            status: newStatus,
            link: `${window.location.origin}/property/${offer.propertyId}`
          }
        });
      }

      toast.success(`Offer marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update offer status");
    }
 };

 const getMatchColor = (offerPrice: number, reservePrice?: number) => {
 if (!reservePrice) return "text-zinc-500 bg-zinc-100";
 if (offerPrice >= reservePrice) return "text-green-700 bg-green-100";
 if (offerPrice >= reservePrice * 0.95) return "text-emerald-700 bg-emerald-100";
 if (offerPrice >= reservePrice * 0.90) return "text-yellow-700 bg-yellow-100";
 if (offerPrice >= reservePrice * 0.85) return "text-orange-700 bg-orange-100";
 return "text-red-700 bg-red-100";
 };

 const getMatchLabel = (offerPrice: number, reservePrice?: number) => {
 if (!reservePrice) return "Unknown";
 if (offerPrice >= reservePrice) return "Excellent";
 if (offerPrice >= reservePrice * 0.95) return "Strong";
 if (offerPrice >= reservePrice * 0.90) return "Good";
 if (offerPrice >= reservePrice * 0.85) return "Moderate";
 return "Low";
 };

 if (fetching || loading) {
 return (
 <div className="p-8 flex items-center justify-center min-h-[50vh]">
 <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
 </div>
 );
 }

 return (
 <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
 <div>
 <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
 <Handshake className="w-8 h-8 text-zinc-700" />
 Negotiation Center
 </h1>
 <p className="text-zinc-500 mt-2">Manage incoming buyer offers and negotiate against seller reserve prices.</p>
 </div>

 <div className="grid grid-cols-1 gap-6">
 {offers.length === 0 ? (
 <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200 border-dashed shadow-sm">
 <Handshake className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
 <h3 className="text-lg font-bold text-zinc-900 mb-1">No offers yet</h3>
 <p className="text-zinc-500 text-sm">When buyers submit offers, they will appear here for your review.</p>
 </div>
 ) : (
 offers.map((offer) => {
 const reservePrice = offer.propertyDetails?.reservePrice;
 const spread = reservePrice ? offer.offerPrice - reservePrice : 0;
 
 return (
 <div key={offer.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
 
 {/* Header */}
 <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
 <div>
 <h3 className="font-bold text-zinc-900 text-lg">{offer.propertyTitle}</h3>
 <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 mt-1">
 <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Submitted {offer.createdAt ? formatDistanceToNow((offer.createdAt as any)?.toDate ? (offer.createdAt as any).toDate() : offer.createdAt) : "Unknown"} ago</span>
 <span className={`px-2 py-0.5 rounded-full capitalize ${
 offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
 offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
 offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
 'bg-zinc-100 text-zinc-800'
 }`}>
 {offer.status}
 </span>
 </div>
 </div>
 
 {/* Action Buttons */}
 {offer.status === 'pending' && (
 <div className="flex items-center gap-2">
 <button onClick={() => handleUpdateStatus(offer.id, 'rejected')} className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
 <X className="w-4 h-4" /> Reject
 </button>
 <button onClick={() => handleUpdateStatus(offer.id, 'accepted')} className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
 <Check className="w-4 h-4" /> Accept Deal
 </button>
 </div>
 )}
 </div>

 {/* Body */}
 <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
 
 {/* Financial Comparison */}
 <div className="space-y-4">
 <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Financial Analysis</h4>
 
 <div className="flex items-center justify-between">
 <div className="text-sm text-zinc-500 font-medium">Buyer Maximum Offer</div>
 <div className="text-xl font-extrabold text-zinc-900">${offer.offerPrice.toLocaleString()}</div>
 </div>
 
 <div className="flex items-center justify-between">
 <div className="text-sm text-zinc-500 font-medium flex items-center gap-1">
 Seller Reserve Price <span className="bg-zinc-100 text-zinc-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Private</span>
 </div>
 <div className="text-lg font-bold text-zinc-700">
 {reservePrice ? `$${reservePrice.toLocaleString()}` : "Not Set"}
 </div>
 </div>

 <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
 <div className="text-sm font-bold text-zinc-900">Spread / Deficit</div>
 <div className={`text-base font-extrabold ${spread >= 0 ? 'text-green-600' : 'text-red-600'}`}>
 {spread > 0 ? '+' : ''}{spread.toLocaleString()}
 </div>
 </div>

 <div className="mt-2 flex items-center justify-between bg-zinc-50 p-3 rounded-lg border border-zinc-100">
 <span className="text-xs font-bold text-zinc-600 uppercase">Match Probability</span>
 <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md ${getMatchColor(offer.offerPrice, reservePrice)}`}>
 {getMatchLabel(offer.offerPrice, reservePrice)} Match
 </span>
 </div>
 </div>

 {/* Buyer Details + Logistics */}
 <div className="space-y-4">
 <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Buyer Details</h4>

 {/* Buyer Info */}
 <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-4 space-y-2">
 <div className="flex items-center gap-2">
 <UserIcon className="w-4 h-4 text-zinc-400 shrink-0" />
 <span className="text-sm font-bold text-zinc-900">{offer.buyerDetails?.name || 'Unknown Buyer'}</span>
 </div>
 <div className="flex items-center gap-2">
 <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
 <a href={`mailto:${offer.buyerDetails?.email}`} className="text-sm text-blue-600 hover:underline">
 {offer.buyerDetails?.email || 'No email'}
 </a>
 </div>
 {(offer.buyerPhone || offer.buyerDetails?.phone) && (
  <div className="flex items-center gap-2">
  <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
  <a href={`tel:${offer.buyerPhone || offer.buyerDetails?.phone}`} className="text-sm text-blue-600 hover:underline">
  {offer.buyerPhone || offer.buyerDetails?.phone}
  </a>
  </div>
  )}
 </div>

 {/* Payment & Move-in */}
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
 <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase mb-1">
 <CreditCard className="w-3.5 h-3.5" /> Payment
 </div>
 <div className="text-sm font-bold text-zinc-900">{offer.paymentType}</div>
 </div>
 <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
 <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase mb-1">
 <Calendar className="w-3.5 h-3.5" /> Move-In
 </div>
 <div className="text-sm font-bold text-zinc-900">
 {offer.moveInDate ? new Date(offer.moveInDate).toLocaleDateString() : 'Not specified'}
 </div>
 </div>
 </div>

 {offer.notes && (
 <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
 <div className="text-xs font-bold text-blue-800 uppercase mb-1">Additional Notes</div>
 <p className="text-sm text-blue-900/80 italic">"{offer.notes}"</p>
 </div>
 )}
 </div>

 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 );
}
