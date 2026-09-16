"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { MapPin, ArrowRight, X, CheckCircle2, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

const OPEN_ROLES: JobOpening[] = [
  {
    id: "broker-luxury",
    title: "Licensed Luxury Real Estate Broker",
    department: "Sales & Acquisitions",
    location: "Auckland / Remuera",
    type: "Full-time (Commission + Base)",
    description: "Lead exclusive sales campaigns for prime residential estates across Auckland and Queenstown. Must hold an active NZ REA license."
  },
  {
    id: "frontend-engineer",
    title: "Senior Full-Stack Engineer (Next.js / TypeScript)",
    department: "Engineering & Product",
    location: "Auckland / Hybrid",
    type: "Full-time",
    description: "Build high-performance real estate digital experiences, interactive maps, 3D floor plan viewers, and mobile applications."
  },
  {
    id: "marketing-lead",
    title: "Property Marketing & Content Specialist",
    department: "Brand & Marketing",
    location: "Auckland, New Zealand",
    type: "Full-time / Hybrid",
    description: "Craft cinematic property video tours, high-intent social campaigns, and architectural feature stories for ultra-high-net-worth clientele."
  }
];

export default function CareersContent() {
  const [selectedRole, setSelectedRole] = useState<JobOpening | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [appliedRoleTitle, setAppliedRoleTitle] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "leads"), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || "Not provided",
        inquiryType: `Job Application: ${selectedRole?.title || "General Application"}`,
        message: `Portfolio/CV: ${portfolio || "None"}\n\nNote: ${notes || "None"}`,
        propertyId: "careers",
        createdAt: Date.now(),
      });

      // Notify admin
      await addDoc(collection(db, "notifications"), {
        userId: "admin_system",
        title: `New Career Application: ${selectedRole?.title}`,
        message: `${name} (${email}) applied for ${selectedRole?.title}.`,
        type: "info",
        isRead: false,
        isPoppedUp: false,
        link: "/admin/crm",
        createdAt: Date.now(),
      }).catch(() => {});

      setAppliedRoleTitle(selectedRole?.title || "Role");
      setSelectedRole(null);
      setName("");
      setEmail("");
      setPhone("");
      setPortfolio("");
      setNotes("");
      toast.success("Your application has been received! Our team will contact you soon.");
    } catch (err) {
      console.error("Application submission error:", err);
      toast.error("Failed to submit application. Please email Info@spsolutions.org.nz directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-28 md:pt-32 pb-20 font-sans relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0073e6] bg-blue-50 px-3 py-1 rounded-full">
            Join Our Mission
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mt-4 mb-4 tracking-tight">
            Build the Future of New Zealand Real Estate
          </h1>
          <p className="text-base md:text-lg text-zinc-600 leading-relaxed">
            Heaven Bricks combines luxury brokerage with state-of-the-art web and mobile technology. Join our passionate team of brokers, engineers, and creatives.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0073e6] flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg mb-2">High Growth & Rewards</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Competitive compensation, modern profit-sharing, and industry-leading commission splits for licensed brokers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg mb-2">Modern Technology</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Work with the best modern toolsets: Next.js, Cloud AI, automated lead matching, and cinematic marketing assets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg mb-2">Trust & Culture</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Autonomous culture, flexible hybrid work arrangements, and a supportive team dedicated to excellence.
            </p>
          </div>
        </div>

        {/* Success Alert if applied */}
        {appliedRoleTitle && (
          <div className="mb-10 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-zinc-900 text-sm">Application Sent for {appliedRoleTitle}!</h4>
                <p className="text-xs text-zinc-600">Our hiring partners will review your profile and reach out via email.</p>
              </div>
            </div>
            <button
              onClick={() => setAppliedRoleTitle(null)}
              className="text-zinc-400 hover:text-zinc-600 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Open Positions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-900">Open Positions ({OPEN_ROLES.length})</h2>
            <span className="text-sm text-zinc-500">Auckland & Remote NZ</span>
          </div>

          <div className="space-y-4">
            {OPEN_ROLES.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                      {job.department}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0073e6]">
                      {job.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">{job.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{job.description}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRole(job)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold rounded-xl transition-all shrink-0"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Spontaneous Application / Contact footer */}
        <div className="mt-16 bg-white rounded-2xl p-8 border border-zinc-200 text-center">
          <h3 className="text-lg font-bold text-zinc-900 mb-2">Don't see your specific role?</h3>
          <p className="text-sm text-zinc-600 max-w-md mx-auto mb-4">
            We are always eager to meet outstanding talent. Send your CV and introduction to our talent team directly.
          </p>
          <a
            href="mailto:Info@spsolutions.org.nz?subject=Spontaneous%20Application%20-%20Heaven%20Bricks"
            className="inline-block text-sm font-bold text-[#0073e6] hover:underline"
          >
            Email Info@spsolutions.org.nz &rarr;
          </a>
        </div>

      </div>

      {/* Application Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRole(null)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-700 p-1 rounded-full hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0073e6]">
                Job Application
              </span>
              <h3 className="text-2xl font-extrabold text-zinc-900 mt-1">
                {selectedRole.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">{selectedRole.department} &bull; {selectedRole.location}</p>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Your Name"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. email@example.com"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0987654321"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  LinkedIn Profile or Portfolio Link
                </label>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Short Note or Summary
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Briefly tell us why you'd be a great fit..."
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-60"
                >
                  {submitting ? "Submitting Application..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
