"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X, Star, Award, ShieldCheck, User, Mail, Phone, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { nzLocations } from "@/lib/nzLocations";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { awardCredits } from "@/lib/wallet";
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";

interface AgentModalProps {
 isOpen: boolean;
 onClose: () => void;
}

export default function AgentModal({ isOpen, onClose }: AgentModalProps) {
  const { user } = useAuth();
  const [region, setRegion] = useState("All New Zealand");
 const [interest, setInterest] = useState("Buy");
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [phone, setPhone] = useState("");
 const [requirements, setRequirements] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isSuccess, setIsSuccess] = useState(false);

 const handleSearch = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!name || !email || !phone) {
 toast.error("Please fill in all contact details");
 return;
 }
 
 setIsSubmitting(true);
 try {
 await addDoc(collection(db, "leads"), {
 leadType: "agent",
 name,
 email,
 phone,
 message: requirements,
 interest,
 preferredRegion: region,
 propertyTitle: `Agent Request - ${interest} in ${region}`,
 propertyId: "agent-request",
 status: "new",
 createdAt: serverTimestamp()
 });

 // Send Email Notification to Admin
 await fetch('/api/email', {
   method: 'POST',
   headers: { 
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_SECRET || 'dev-secret-key'}`
   },
   body: JSON.stringify({
     to: 'sanjayranatanabana@gmail.com', // Admin Email (from .env or hardcoded for now)
     templateType: 'agentRequested',
     payload: {
       name,
       email,
       phone,
       interest,
       region,
       requirements
     }
   })
 }).catch(err => console.error("Failed to send email notification", err));

  // Send In-App Admin Notification
  await addDoc(collection(db, "notifications"), {
    userId: "admin_system",
    title: `New Agent Request: ${name}`,
    message: `${name} (Ph: ${phone}) wants to ${interest} in ${region}.`,
    type: "info",
    isRead: false,
    isPoppedUp: false,
    link: "/admin/crm",
    createdAt: Date.now()
  }).catch(err => console.error("Failed to create admin notification", err));

  if (email) {
    sendNotificationEmail({
      to: email,
      templateType: "userActionConfirmation",
      payload: {
        userName: name || "Valued Client",
        actionTitle: "Agent Request Received",
        actionMessage: "Thank you for reaching out! We have received your request to connect with a premium agent. Our team will match you with the best expert for your needs and contact you shortly.",
        actionDetails: {
          "Interest": interest,
          "Region": region,
          "Contact Number": phone
        }
      }
    });
  }

  if (user) {
    await awardCredits(user.uid, 50, "Find an Agent Form");
  }

 setIsSuccess(true);
 toast.success("Request submitted successfully!");
 setTimeout(() => {
 onClose();
 setIsSuccess(false);
 setName("");
 setEmail("");
 setPhone("");
 setRequirements("");
 }, 3000);
 } catch (error) {
 console.error("Error submitting lead:", error);
 toast.error("Failed to submit request. Please try again.");
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={onClose}
 />
 
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
 >
 {/* Decorative top bar */}
 <div className="h-2 w-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)]"></div>
 
 <button 
 onClick={onClose}
 className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors z-10"
 >
 <X className="w-5 h-5" />
 </button>

 {/* Form */}
 {isSuccess ? (
 <div className="p-12 text-center flex flex-col items-center">
 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
 <ShieldCheck className="w-10 h-10" />
 </div>
 <h3 className="text-2xl font-bold text-zinc-900 mb-2">Request Received!</h3>
 <p className="text-zinc-600 max-w-md mx-auto">
 Our top agents in your selected area will review your requirements and reach out to you shortly.
 </p>
 </div>
 ) : (
 <div className="p-8 md:p-10 max-h-[85vh] overflow-y-auto">
 <div className="mb-8">
 <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-primary-dark)] tracking-tight mb-2">Find a Top Agent</h2>
 <p className="text-sm font-medium text-zinc-600 max-w-sm">
 Connect with New Zealand's elite real estate professionals to help you buy, sell, or rent.
 </p>
 </div>

 <form onSubmit={handleSearch} className="space-y-5">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <label className="block">
 <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Location</span>
 <div className="relative">
 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
 <select 
 required
 value={region}
 onChange={(e) => setRegion(e.target.value)}
 className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-[var(--color-primary)] focus:bg-white rounded-xl text-sm text-zinc-900 outline-none transition-colors appearance-none"
 >
 <option>All New Zealand</option>
 {Object.keys(nzLocations).map(reg => (
 <option key={reg} value={reg}>{reg}</option>
 ))}
 </select>
 </div>
 </label>
 
 <label className="block">
 <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Intent</span>
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
 <select 
 required
 value={interest}
 onChange={(e) => setInterest(e.target.value)}
 className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-[var(--color-primary)] focus:bg-white rounded-xl text-sm text-zinc-900 outline-none transition-colors appearance-none"
 >
 <option value="Buy">Buy a property</option>
 <option value="Sell">Sell a property</option>
 <option value="Rent">Rent a property</option>
 </select>
 </div>
 </label>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <label className="block">
 <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Full Name</span>
 <div className="relative">
 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
 <input 
 type="text" 
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="e.g. Your Name"
 className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-[var(--color-primary)] focus:bg-white rounded-xl text-sm text-zinc-900 outline-none transition-colors"
 />
 </div>
 </label>

 <label className="block">
 <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Address</span>
 <div className="relative">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
 <input 
 type="email" 
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="e.g. email@example.com"
 className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-[var(--color-primary)] focus:bg-white rounded-xl text-sm text-zinc-900 outline-none transition-colors"
 />
 </div>
 </label>
 </div>

 <label className="block">
 <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Phone Number</span>
 <div className="relative">
 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
 <input 
 type="tel" 
 required
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="0987654321"
 className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-[var(--color-primary)] focus:bg-white rounded-xl text-sm text-zinc-900 outline-none transition-colors"
 />
 </div>
 </label>

 <label className="block">
 <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Specific Requirements</span>
 <textarea 
 required
 rows={3}
 value={requirements}
 onChange={(e) => setRequirements(e.target.value)}
 placeholder="E.g. Looking for a 3 bedroom house with a backyard..."
 className="w-full p-4 bg-zinc-50 border border-zinc-200 focus:border-[var(--color-primary)] focus:bg-white rounded-xl text-sm text-zinc-900 outline-none transition-colors resize-none"
 ></textarea>
 </label>

 <button 
 type="submit"
 disabled={isSubmitting}
 className="w-full mt-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] hover:from-[var(--color-primary-dark)] hover:to-[#0f172a] text-white font-bold text-sm uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-70 disabled:cursor-not-allowed"
 >
 {isSubmitting ? (
 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
 ) : (
 <>
 Request Contact <Send className="w-4 h-4" />
 </>
 )}
 </button>
 
 <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-zinc-100">
 <div className="flex items-center gap-2">
 <Star className="w-4 h-4 text-[var(--color-primary)]" />
 <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Verified Reviews</span>
 </div>
 <div className="flex items-center gap-2">
 <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
 <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">REA Approved</span>
 </div>
 </div>

 </form>
 </div>
 )}
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 );
}
