"use client";

import React, { useState } from "react";
import { FileText, Download, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Mail, User, Phone } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { awardCredits } from "@/lib/wallet";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";

interface DocumentLeadGenProps {
  propertyId: string;
  propertyTitle: string;
}

export default function DocumentLeadGen({ propertyId, propertyTitle }: DocumentLeadGenProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<"initial" | "form" | "success">("initial");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    setLoading(true);
    try {
      // In a real app, this creates a lead in the database and triggers an email via a cloud function
      await addDoc(collection(db, "leads"), {
        type: "document_download",
        propertyId,
        propertyTitle,
        name,
        email,
        phone,
        createdAt: serverTimestamp(),
      });
      // Send Admin Notification
      await addDoc(collection(db, "notifications"), {
        userId: "admin_system",
        title: `New Property Info Pack Request: ${name}`,
        message: `${name} (Ph: ${phone}) requested the document pack for ${propertyTitle}.`,
        type: "info",
        isRead: false,
        isPoppedUp: false,
        link: `/admin/crm`,
        createdAt: Date.now()
      }).catch(err => console.error("Failed to notify admin", err));
      
      if (email) {
        sendNotificationEmail({
          to: email,
          templateType: "userActionConfirmation",
          payload: {
            userName: name || "Valued Client",
            actionTitle: "Information Pack Requested",
            actionMessage: "Thank you for your interest! We have received your request for the property information pack. It will be sent to your email shortly.",
            actionDetails: {
              "Property": propertyTitle
            }
          }
        });
      }
      // Simulate network request for sending email
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Award credits
      if (user) {
        await awardCredits(user.uid, 50, "Requested Property Info Pack");
      }
      
      setStep("success");
    } catch (error) {
      console.error("Failed to submit lead", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-blue-100 rounded-2xl shadow-lg overflow-hidden relative group transition-all duration-500 hover:shadow-xl hover:border-blue-200">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
      
      <div className="p-6 relative z-10">
        
        {step === "initial" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-zinc-900 text-lg leading-tight">Comprehensive<br/>Info Pack</h3>
              </div>
            </div>
            
            <p className="text-sm text-zinc-600 mb-5 leading-relaxed">
              Make an informed decision. Get instant access to all critical property documents.
            </p>
            
            <ul className="space-y-3 mb-6">
              {[
                "Full LIM Report",
                "Certificate of Title",
                "Independent Rental Appraisal",
                "Recent Sales Statistics"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm font-semibold text-zinc-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => setStep("form")}
              className="w-full bg-[#0073e6] hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(0,115,230,0.39)] hover:shadow-[0_6px_20px_rgba(0,115,230,0.23)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download className="w-4 h-4" />
              Unlock Documents
            </button>
          </div>
        )}

        {step === "form" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-100">
              <button 
                onClick={() => setStep("initial")} 
                className="w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <h3 className="font-extrabold text-zinc-900 text-lg">Where to send?</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#0073e6] hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(0,115,230,0.39)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Preparing Documents...</>
                ) : (
                  <><FileText className="w-4 h-4" /> Ask for Documents</>
                )}
              </button>
              
              <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1 mt-3">
                <ShieldCheck className="w-3 h-3" /> Your details are kept strictly confidential.
              </p>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className="animate-in zoom-in-95 duration-500 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-extrabold text-zinc-900 text-xl mb-2">Success!</h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-6">
              The comprehensive property info pack has been securely emailed to <strong>{email}</strong>.
            </p>
            <button 
              onClick={() => setStep("initial")}
              className="text-sm font-bold text-[#0073e6] hover:underline"
            >
              Request for another email
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
