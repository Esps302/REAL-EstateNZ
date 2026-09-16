"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Send, CheckCircle2, User, Mail, Phone, MessageSquare, HelpCircle } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // 1. Save to Firestore leads collection
      await addDoc(collection(db, "leads"), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || "Not provided",
        inquiryType,
        message: message.trim(),
        propertyId: "direct_contact",
        createdAt: Date.now(),
      });

      // 2. Notify Admin System
      await addDoc(collection(db, "notifications"), {
        userId: "admin_system",
        title: `New Contact Inquiry: ${inquiryType}`,
        message: `${name} (${email}) sent a message: "${message.slice(0, 80)}..."`,
        type: "info",
        isRead: false,
        isPoppedUp: false,
        link: "/admin/crm",
        createdAt: Date.now(),
      }).catch((err) => console.error("Notification write error:", err));

      // 3. Trigger email notification in background
      fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET || "dev-secret-key"}`,
        },
        body: JSON.stringify({
          to: "Info@spsolutions.org.nz",
          templateType: "agentRequested",
          payload: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || "Not provided",
            interest: inquiryType,
            region: "Auckland / New Zealand",
            requirements: message.trim(),
          },
        }),
      }).catch((err) => console.error("Email notification error:", err));

      setSubmitted(true);
      toast.success("Thank you! Your message has been sent successfully.");
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to send your message. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 mb-2">Message Received!</h3>
        <p className="text-zinc-600 max-w-md mx-auto mb-6">
          Thank you for getting in touch, <strong>{name}</strong>. Our Auckland managing brokers will review your message and respond within 24 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
          }}
          className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-semibold text-zinc-900 mb-2">
            Your Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Your Name"
              className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-zinc-900 transition-all text-sm placeholder:text-zinc-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-semibold text-zinc-900 mb-2">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. email@example.com"
              className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-zinc-900 transition-all text-sm placeholder:text-zinc-400"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contact-phone" className="block text-sm font-semibold text-zinc-900 mb-2">
            Phone Number
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0987654321"
              className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-zinc-900 transition-all text-sm placeholder:text-zinc-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-inquiry-type" className="block text-sm font-semibold text-zinc-900 mb-2">
            Inquiry Type
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <HelpCircle className="h-5 w-5 text-zinc-400" />
            </div>
            <select
              id="contact-inquiry-type"
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-zinc-900 transition-all text-sm cursor-pointer"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Free Property Appraisal">Free Property Appraisal</option>
              <option value="Buying a Property">Buying a Property</option>
              <option value="Selling a Property">Selling / Listing a Property</option>
              <option value="Support & Account Help">Support & Account Help</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-semibold text-zinc-900 mb-2">
          Your Message <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-sm">
          <div className="absolute top-3 left-4 pointer-events-none">
            <MessageSquare className="h-5 w-5 text-zinc-400" />
          </div>
          <textarea
            id="contact-message"
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about the property you're looking for, or how we can assist you..."
            className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-zinc-900 transition-all text-sm placeholder:text-zinc-400 resize-y"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Sending Inquiry...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}
