"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Settings, Save, Upload, User, Loader2 } from "lucide-react";
import Image from "next/image";

export default function AdminSettingsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [brokerName, setBrokerName] = useState("Mike Pankaj");
  const [brokerAvatarUrl, setBrokerAvatarUrl] = useState("/mike_pankaj.png");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || (userData?.role !== "admin" && userData?.role !== "super_admin")) {
        router.push("/dashboard");
      }
    }
  }, [user, userData, authLoading, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "site");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.brokerName) setBrokerName(data.brokerName);
          if (data.brokerAvatarUrl) setBrokerAvatarUrl(data.brokerAvatarUrl);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `settings/broker_avatar_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setBrokerAvatarUrl(url);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "site"), {
        brokerName,
        brokerAvatarUrl,
        updatedAt: Date.now()
      }, { merge: true });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loadingSettings) {
    return <div className="flex-1 flex items-center justify-center h-screen">Loading Settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#0073e6]" />
          Platform Settings
        </h1>
        <p className="text-sm text-zinc-500 font-medium mt-1">
          Manage your global platform configurations and broker profile.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50">
          <h2 className="font-bold text-zinc-900">Broker Profile Settings</h2>
          <p className="text-xs text-zinc-500 mt-1">This information is displayed in the Pricing Strategy block on all property pages.</p>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-4">Broker Avatar</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-zinc-100 relative shrink-0">
                {brokerAvatarUrl ? (
                  <Image 
                    src={brokerAvatarUrl}
                    alt="Broker Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0073e6]" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="px-4 py-2 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-md text-sm font-semibold text-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm">
                  <Upload className="w-4 h-4 text-zinc-500" />
                  {isUploading ? "Uploading..." : "Upload New Image"}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
                <p className="text-xs text-zinc-400 mt-2">Recommended: Square image, at least 256x256px.</p>
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">Broker Name</label>
            <input 
              type="text" 
              value={brokerName}
              onChange={(e) => setBrokerName(e.target.value)}
              className="w-full max-w-md px-4 py-2 bg-white border border-zinc-300 focus:border-[#0073e6] focus:ring-1 focus:ring-[#0073e6] rounded-md text-sm transition-all outline-none"
              placeholder="e.g., Mike Pankaj"
            />
          </div>

        </div>

        <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#0073e6] hover:bg-[#005bb5] text-white font-bold rounded-md text-sm transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
