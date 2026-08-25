"use client";

import { useState } from "react";
import { Send, CheckCircle2, Home, BarChart3, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function LeadGenForm() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", intention: "appraisal" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Request received! Our team will contact you shortly.");
      
      // Reset form after a few seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: "", email: "", phone: "", intention: "appraisal" });
      }, 5000);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden relative">
      {/* Decorative top bar */}
      <div className="h-2 w-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)]"></div>
      
      <div className="p-6">
        <h3 className="text-xl md:text-2xl font-extrabold text-[var(--color-primary-dark)] mb-1 tracking-tight">
          Unlock Exclusive Market Insights
        </h3>
        <p className="text-zinc-600 mb-6 text-sm font-medium">
          Register for VIP access to off-market properties and expert appraisals.
        </p>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 mb-2">Request Received</h4>
              <p className="text-zinc-600 max-w-sm">
                Thank you, {formData.name.split(" ")[0]}. A senior advisor will be in touch with you shortly.
              </p>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <label className="block">
                  <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Full Name</span>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Sanjay Rana"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[var(--color-primary)] focus:bg-white rounded-xl px-4 py-3 text-sm text-zinc-900 outline-none transition-colors"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Phone Number</span>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+64 21 000 0000"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[var(--color-primary)] focus:bg-white rounded-xl px-4 py-3 text-sm text-zinc-900 outline-none transition-colors"
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Address</span>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="sanjay@example.com"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-[var(--color-primary)] focus:bg-white rounded-xl px-4 py-3 text-sm text-zinc-900 outline-none transition-colors"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">How can we help?</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, intention: "appraisal"})}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      formData.intention === "appraisal" 
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary-dark)]" 
                        : "border-zinc-200 hover:border-zinc-300 text-zinc-600"
                    }`}
                  >
                    <BarChart3 className={`w-6 h-6 mb-2 ${formData.intention === "appraisal" ? "text-[var(--color-primary)]" : "text-zinc-400"}`} />
                    <span className="text-xs font-bold text-center leading-tight">Free Property<br/>Appraisal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, intention: "buying"})}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      formData.intention === "buying" 
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary-dark)]" 
                        : "border-zinc-200 hover:border-zinc-300 text-zinc-600"
                    }`}
                  >
                    <Home className={`w-6 h-6 mb-2 ${formData.intention === "buying" ? "text-[var(--color-primary)]" : "text-zinc-400"}`} />
                    <span className="text-xs font-bold text-center leading-tight">Finding My<br/>Dream Home</span>
                  </button>
                </div>
              </label>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] hover:from-[var(--color-primary-dark)] hover:to-[#0f172a] text-white font-bold text-sm uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Request Access <Send className="w-4 h-4" />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-zinc-500 font-medium">
                <Clock className="w-3 h-3" /> Usually responds within 2 hours
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
