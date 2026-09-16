"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Shield, BarChart3, Megaphone, Check } from "lucide-react";

export default function CookiesPage() {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedPref = localStorage.getItem("heaven_bricks_cookie_pref");
      if (savedPref) {
        const parsed = JSON.parse(savedPref);
        if (typeof parsed.analytics === "boolean") setAnalytics(parsed.analytics);
        if (typeof parsed.marketing === "boolean") setMarketing(parsed.marketing);
      }
    } catch (e) {
      console.error("Error reading cookie preferences:", e);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(
        "heaven_bricks_cookie_pref",
        JSON.stringify({
          essential: true,
          analytics,
          marketing,
          updatedAt: Date.now(),
        })
      );
      setSaved(true);
      toast.success("Your cookie preferences have been saved.");
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Error saving cookie preferences:", e);
      toast.error("Could not save preferences to your browser.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-28 md:pt-32 pb-20 font-sans relative z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-4 tracking-tight">
          Cookie Preferences
        </h1>
        <p className="text-base md:text-lg text-zinc-600 mb-8 leading-relaxed">
          We use cookies to maintain your active login session, secure transactions, analyze site performance, and personalize your experience on Heaven Bricks.
        </p>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-zinc-200 space-y-6">
          
          {/* Essential */}
          <div className="p-5 border border-zinc-200 rounded-2xl bg-zinc-50 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-200/80 flex items-center justify-center text-zinc-800 shrink-0 mt-0.5">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-zinc-900 text-base">Essential Cookies</h3>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md">
                    Always On
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Required for core platform security, Firebase authentication sessions, and transaction integrity. These cannot be disabled.
                </p>
              </div>
            </div>
            <div className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed items-center rounded-full bg-zinc-900 opacity-60">
              <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
            </div>
          </div>

          {/* Analytics */}
          <div className="p-5 border border-zinc-200 rounded-2xl bg-zinc-50 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#0073e6] shrink-0 mt-0.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-base">Analytics & Performance</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Helps us understand how visitors interact with property searches, map views, and floor plans so we can continuously optimize load times.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={analytics}
              onClick={() => setAnalytics(!analytics)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 ${
                analytics ? "bg-zinc-900" : "bg-zinc-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  analytics ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Marketing */}
          <div className="p-5 border border-zinc-200 rounded-2xl bg-zinc-50 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-base">Personalized Recommendations</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Used by our Smart Match engine to recommend listings matching your architectural tastes and preferred New Zealand suburbs.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={marketing}
              onClick={() => setMarketing(!marketing)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 ${
                marketing ? "bg-zinc-900" : "bg-zinc-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  marketing ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Preferences Saved</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
            <p className="text-xs text-zinc-500">
              Settings are stored locally on your current device.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
