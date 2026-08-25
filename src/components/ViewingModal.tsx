"use client";

import React, { useState } from 'react';
import { X, Calendar, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { awardCredits } from "@/lib/wallet";
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";

interface ViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

export function ViewingModal({ isOpen, onClose, propertyId, propertyTitle }: ViewingModalProps) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    date: '',
    time: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  // Get tomorrow's date as minimum date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "viewings"), {
        propertyId,
        propertyTitle,
        userId: user?.uid || null,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        status: "pending",
        createdAt: serverTimestamp()
      });

      // Send Admin Email Notification
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
            name: formData.name,
            email: formData.email || 'No email',
            phone: formData.phone,
            address: 'Not provided',
            serviceType: 'Viewing Appointment',
            propertyAddress: propertyTitle
          }
        })
      }).catch(err => console.error("Failed to send admin email notification", err));

      // Send In-App Admin Notification
      await addDoc(collection(db, "notifications"), {
        userId: "admin_system",
        title: `New Viewing Request: ${formData.name}`,
        message: `${formData.name} (Ph: ${formData.phone}) requested a viewing for ${propertyTitle} on ${formData.date} at ${formData.time}.`,
        type: "info",
        isRead: false,
        isPoppedUp: false,
        link: "/admin/viewings",
        createdAt: serverTimestamp()
      });

      if (formData.email) {
        sendNotificationEmail({
          to: formData.email,
          templateType: "userActionConfirmation",
          payload: {
            userName: formData.name || "Valued Client",
            actionTitle: "Viewing Request Received",
            actionMessage: "We have received your request to view this property. One of our agents will reach out to confirm your appointment shortly.",
            actionDetails: {
              "Property": propertyTitle,
              "Requested Date": formData.date,
              "Requested Time": formData.time
            }
          }
        });
      }
      
      // Award credits
      if (user) {
        await awardCredits(user.uid, 50, "Requested Property Viewing");
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setFormData({ ...formData, date: '', time: '', phone: '' });
      }, 3000);
    } catch (error) {
      console.error("Error booking viewing:", error);
      alert("Failed to schedule viewing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Schedule a Viewing</h3>
            <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{propertyTitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <div>
                <h4 className="text-lg font-bold text-zinc-900">Viewing Requested!</h4>
                <p className="text-sm text-zinc-500 mt-1 max-w-[250px]">
                  Our agent will review your request and confirm your appointment shortly.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </label>
                  <input 
                    type="date" 
                    required
                    min={minDate}
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:border-[#0073e6] focus:ring-1 focus:ring-[#0073e6] outline-none"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Time
                  </label>
                  <select 
                    required
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:border-[#0073e6] focus:ring-1 focus:ring-[#0073e6] outline-none"
                  >
                    <option value="">Select time...</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:border-[#0073e6] focus:ring-1 focus:ring-[#0073e6] outline-none"
                  placeholder="Sanjay Rana"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:border-[#0073e6] focus:ring-1 focus:ring-[#0073e6] outline-none"
                  placeholder="sanjayrana@gmail.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:border-[#0073e6] focus:ring-1 focus:ring-[#0073e6] outline-none"
                  placeholder="e.g., 021 555 1234"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#0073e6] hover:bg-[#005bb5] text-white font-bold rounded-md text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Requesting...' : 'Confirm Viewing Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
