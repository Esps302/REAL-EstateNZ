"use client";

import React, { useState } from "react";
import { Calendar, Building, Scale, CheckCircle2 } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { awardCredits } from "@/lib/wallet";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Property } from "@/types";
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";

interface ServiceRequestFormProps {
 property: Property;
 onSuccess?: () => void;
 initialService?: 'viewing' | 'mortgage' | 'solicitor' | null;
}

export function ServiceRequestForm({ property, onSuccess, initialService }: ServiceRequestFormProps) {
 const { user, userData } = useAuth();
 
 // Contact Fields
 const [fullName, setFullName] = useState(userData?.name || user?.displayName || "");
 const [phone, setPhone] = useState(userData?.phone || "");
 const [address, setAddress] = useState(userData?.location || "");

 // Service Toggles
 const [wantsViewing, setWantsViewing] = useState(initialService === 'viewing');
 const [wantsMortgage, setWantsMortgage] = useState(initialService === 'mortgage');
 const [wantsSolicitor, setWantsSolicitor] = useState(initialService === 'solicitor');

 // Viewing Fields
 const [viewingDate, setViewingDate] = useState("");
 const [viewingTime, setViewingTime] = useState("Morning (9AM - 12PM)");
 const [viewingNotes, setViewingNotes] = useState("");

 // Mortgage Fields
 const [income, setIncome] = useState("");
 const [employmentStatus, setEmploymentStatus] = useState("Employed");
 const [preferredBank, setPreferredBank] = useState("");

 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!user || !userData) {
 setError("You must be logged in to request services.");
 return;
 }

 if (!wantsViewing && !wantsMortgage && !wantsSolicitor) {
 setError("Please select at least one service to request.");
 return;
 }
 
 if (!fullName.trim() || !phone.trim() || !address.trim()) {
 setError("Name, Phone Number, and Address are required.");
 return;
 }

 if (wantsMortgage && !income.trim()) {
 setError("Annual income is required for Mortgage Pre-Approval.");
 return;
 }

 setSubmitting(true);
 setError("");

 try {
 const promises = [];

 if (wantsViewing) {
 if (!viewingDate) throw new Error("Please select a preferred viewing date.");
 promises.push(addDoc(collection(db, "viewings"), {
 propertyId: property.id,
 propertyTitle: property.title,
 buyerId: user.uid,
 clientName: fullName,
 name: fullName,
 email: user.email || '',
 clientPhone: phone,
 phone: phone,
 clientAddress: address,
 preferredDate: new Date(viewingDate).getTime(),
 date: viewingDate,
 preferredTime: viewingTime,
 time: viewingTime,
 notes: viewingNotes,
 status: "pending",
 createdAt: Date.now()
 }));
 }

 if (wantsMortgage) {
 promises.push(addDoc(collection(db, "mortgages"), {
 propertyId: property.id,
 buyerId: user.uid,
 clientName: fullName,
 clientPhone: phone,
 clientAddress: address,
 income: Number(income) || 0,
 employmentStatus,
 preferredBank,
 status: "pending",
 createdAt: Date.now()
 }));
 }

 if (wantsSolicitor) {
 promises.push(addDoc(collection(db, "solicitors"), {
 propertyId: property.id,
 buyerId: user.uid,
 clientName: fullName,
 clientPhone: phone,
 clientAddress: address,
 status: "pending",
 createdAt: Date.now()
 }));
 }

 await Promise.all(promises);

  // Send to CRM Leads (Only for Mortgage & Solicitor)
  const crmServices = [
    wantsMortgage ? 'Mortgage' : null,
    wantsSolicitor ? 'Solicitor' : null
  ].filter(Boolean).join(', ');

  if (crmServices) {
    await addDoc(collection(db, "leads"), {
      propertyId: property.id,
      propertyTitle: property.title,
      name: fullName,
      email: user.email || '',
      phone: phone,
      address: address,
      message: `Requested Services: ${crmServices}.`,
      status: "new",
      leadType: "property",
      createdAt: serverTimestamp()
    }).catch(err => console.error("Failed to create CRM lead", err));
  }

  // Send Email Notification to Admin
  const requestedServices = [
    wantsViewing ? 'Viewing' : null,
    wantsMortgage ? 'Mortgage' : null,
    wantsSolicitor ? 'Solicitor' : null
  ].filter(Boolean).join(', ');

  await fetch('/api/email', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_SECRET || 'dev-secret-key'}`
    },
    body: JSON.stringify({
      to: 'sanjayranatanabana@gmail.com', // Admin Email
      templateType: 'serviceRequested',
      payload: {
        name: fullName,
        email: user.email || 'No email',
        phone: phone,
        address: address,
        serviceType: requestedServices,
        propertyAddress: property.title || property.id
      }
    })
  }).catch(err => console.error("Failed to send email notification", err));

  // Send In-App Admin Notification
  await addDoc(collection(db, "notifications"), {
    userId: "admin_system",
    title: `New Service Request: ${fullName}`,
    message: `${fullName} (Ph: ${phone}) requested: ${requestedServices} for ${property.title || 'a property'}.`,
    type: "info",
    isRead: false,
    isPoppedUp: false,
    link: "/admin/crm",
    createdAt: serverTimestamp()
  }).catch(err => console.error("Failed to create admin notification", err));

  if (user.email) {
    sendNotificationEmail({
      to: user.email,
      templateType: "userActionConfirmation",
      payload: {
        userName: fullName || "Valued Client",
        actionTitle: "Service Request Received",
        actionMessage: "We have received your service request. Our team will review your requirements and an expert will get in touch with you shortly.",
        actionDetails: {
          "Requested Services": requestedServices,
          "Property": property.title || "N/A",
          "Contact Number": phone
        }
      }
    });
  }

  // Award credits for service request
  await awardCredits(user.uid, 50, "Requested Property Services");

  setSuccess(true);
  if (onSuccess) onSuccess();
 } catch (err: any) {
 setError(err.message || "Failed to submit request.");
 setSubmitting(false);
 }
 };

 if (success) {
 return (
 <div className="bg-white rounded-3xl p-8 w-full text-center border border-zinc-200">
 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <CheckCircle2 className="w-8 h-8 text-blue-600" />
 </div>
 <h2 className="text-2xl font-bold text-zinc-900 mb-2">Request Submitted</h2>
 <p className="text-zinc-600 text-sm">Our brokerage team will coordinate your requested services and contact you shortly.</p>
 </div>
 );
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 {error && <div className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
 
 {/* Contact Details */}
 <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-4">
 <h4 className="font-bold text-zinc-900 text-sm">Your Contact Details</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-zinc-600 mb-1">Full Name *</label>
 <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm" />
 </div>
 <div>
 <label className="block text-xs font-bold text-zinc-600 mb-1">Phone Number *</label>
 <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm" />
 </div>
 <div className="md:col-span-2">
 <label className="block text-xs font-bold text-zinc-600 mb-1">Address *</label>
 <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm" />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-3">
 <div 
 onClick={() => setWantsViewing(!wantsViewing)}
 className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${wantsViewing ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}
 >
 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${wantsViewing ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
 <Calendar className="w-5 h-5" />
 </div>
 <div>
 <h3 className={`font-bold text-sm ${wantsViewing ? 'text-zinc-900' : 'text-zinc-700'}`}>Schedule Viewing</h3>
 <p className="text-xs text-zinc-500">Visit the property in person</p>
 </div>
 </div>

 <div 
 onClick={() => setWantsMortgage(!wantsMortgage)}
 className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${wantsMortgage ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}
 >
 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${wantsMortgage ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
 <Building className="w-5 h-5" />
 </div>
 <div>
 <h3 className={`font-bold text-sm ${wantsMortgage ? 'text-zinc-900' : 'text-zinc-700'}`}>Get a Mortgage</h3>
 <p className="text-xs text-zinc-500">Pre-approval assistance</p>
 </div>
 </div>

 <div 
 onClick={() => setWantsSolicitor(!wantsSolicitor)}
 className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${wantsSolicitor ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}
 >
 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${wantsSolicitor ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
 <Scale className="w-5 h-5" />
 </div>
 <div>
 <h3 className={`font-bold text-sm ${wantsSolicitor ? 'text-zinc-900' : 'text-zinc-700'}`}>Assign Solicitor</h3>
 <p className="text-xs text-zinc-500">Legal representation</p>
 </div>
 </div>
 </div>

 {wantsViewing && (
 <div className="space-y-4 p-5 bg-zinc-50 rounded-xl border border-zinc-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
 <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-2"><Calendar className="w-4 h-4"/> Viewing Details</h4>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-zinc-600 mb-1">Preferred Date</label>
 <input type="date" required={wantsViewing} value={viewingDate} onChange={e => setViewingDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm" />
 </div>
 <div>
 <label className="block text-xs font-bold text-zinc-600 mb-1">Time of Day</label>
 <select required={wantsViewing} value={viewingTime} onChange={e => setViewingTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm">
 <option>Morning (9AM - 12PM)</option>
 <option>Afternoon (12PM - 4PM)</option>
 <option>Evening (4PM - 7PM)</option>
 </select>
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-zinc-600 mb-1">Notes</label>
 <input type="text" value={viewingNotes} onChange={e => setViewingNotes(e.target.value)} placeholder="Any special requirements?" className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm" />
 </div>
 </div>
 )}

 {wantsMortgage && (
 <div className="space-y-4 p-5 bg-zinc-50 rounded-xl border border-zinc-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
 <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-2"><Building className="w-4 h-4"/> Mortgage Pre-Approval</h4>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-zinc-600 mb-1">Annual Income ($) *</label>
 <input type="number" required={wantsMortgage} value={income} onChange={e => setIncome(e.target.value)} placeholder="e.g. 120000" className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm" />
 </div>
 <div>
 <label className="block text-xs font-bold text-zinc-600 mb-1">Employment</label>
 <select required={wantsMortgage} value={employmentStatus} onChange={e => setEmploymentStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm">
 <option>Employed Full-Time</option>
 <option>Self-Employed</option>
 <option>Retired</option>
 <option>Other</option>
 </select>
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-zinc-600 mb-1">Preferred Bank (Optional)</label>
 <input type="text" value={preferredBank} onChange={e => setPreferredBank(e.target.value)} placeholder="e.g. Chase, Wells Fargo" className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm" />
 </div>
 </div>
 )}

 {wantsSolicitor && (
 <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
 <Scale className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
 <p>Our platform will automatically assign a certified real estate solicitor to handle the legal documentation and conveyancing for this transaction securely.</p>
 </div>
 )}

 <button type="submit" disabled={submitting || (!wantsViewing && !wantsMortgage && !wantsSolicitor)} className="w-full py-4 mt-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-md text-base">
 {submitting ? "Submitting Request..." : "Submit Service Request"}
 </button>
 </form>
 );
}
