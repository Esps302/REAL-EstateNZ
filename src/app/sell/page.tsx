"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { purchaseListing } from "@/lib/wallet";
import Link from "next/link";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Image as ImageIcon, Upload, X, Shield } from "lucide-react";
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";

const AVAILABLE_AMENITIES = [
 "Air Conditioning", "Swimming Pool", "Balcony / Deck", "Gym / Fitness Center", 
 "Built-in Wardrobes", "Dishwasher", "Fenced Yard", "Furnished", 
 "Garage", "Heating", "Broadband / WiFi", "Pet Friendly", 
 "Security System", "Spa / Hot Tub", "Tennis Court", "Walk-in Closet", 
 "Ocean View", "Mountain View", "City Skyline View", "Solar Panels", 
 "Double Glazed Windows", "Elevator / Lift Access", "Fireplace", "Secure Parking", "Wheelchair Accessible"
];

export default function SellPage() {
 const { user, userData, loading, wallet } = useAuth();
 const router = useRouter();

 // Form State
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState("");
 const [selectedPlan, setSelectedPlan] = useState<"Basic" | "Premium" | "Featured">("Basic");
 
 // Property Data State
 const [formData, setFormData] = useState({
 title: "",
 description: "",
 price: "",
 reservePrice: "",
 listingType: "For Sale",
 propertyType: "House",
 address: "",
 city: "",
 suburb: "",
 bedrooms: "",
 bathrooms: "",
 parkingSpaces: "",
 yearBuilt: "",
 area: "",
 mapEmbed: "",
 });

 const [kycConfirmed, setKycConfirmed] = useState(false);

 // File States
 const [coverImage, setCoverImage] = useState<File | null>(null);
 const [galleryImages, setGalleryImages] = useState<File[]>([]);
 const [floorPlanImage, setFloorPlanImage] = useState<File | null>(null);

 // Amenities State
 const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
 const [customAmenityInput, setCustomAmenityInput] = useState("");
 const [customAmenitiesList, setCustomAmenitiesList] = useState<string[]>([]);

 // Refs for hidden inputs
 const coverInputRef = useRef<HTMLInputElement>(null);
 const galleryInputRef = useRef<HTMLInputElement>(null);
 const floorPlanInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 if (!loading) {
 if (!user) {
 router.push('/login');
 } else if (userData && userData.role === 'buyer') {
 router.push('/dashboard');
 }
 }
 }, [user, userData, loading, router]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 setFormData({
 ...formData,
 [e.target.name]: e.target.value
 });
 };

 const handleAmenityToggle = (amenity: string) => {
 setSelectedAmenities(prev => 
 prev.includes(amenity) 
 ? prev.filter(a => a !== amenity)
 : [...prev, amenity]
 );
 };

 const handleAddCustomAmenity = (e: React.MouseEvent) => {
 e.preventDefault();
 const trimmed = customAmenityInput.trim();
 if (trimmed && !AVAILABLE_AMENITIES.includes(trimmed) && !customAmenitiesList.includes(trimmed)) {
 setCustomAmenitiesList(prev => [...prev, trimmed]);
 setSelectedAmenities(prev => [...prev, trimmed]);
 setCustomAmenityInput("");
 }
 };

 const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files[0]) {
 setCoverImage(e.target.files[0]);
 }
 };

 const handleFloorPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files[0]) {
 setFloorPlanImage(e.target.files[0]);
 }
 };

 const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files) {
 const newFiles = Array.from(e.target.files);
 setGalleryImages(prev => {
 const combined = [...prev, ...newFiles];
 return combined.slice(0, 25); // Enforce max 25 images
 });
 }
 };

 const removeGalleryImage = (index: number) => {
 setGalleryImages(prev => prev.filter((_, i) => i !== index));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");

 if (!user || !wallet) {
 setError("You must be logged in with an active wallet to post a property.");
 return;
 }

 const planPrices = {
 Basic: 0.50,
 Premium: 1.00,
 Featured: 5.00
 };

 const priceToPay = planPrices[selectedPlan];
 
 if (wallet.balance < priceToPay) {
 setError(`Insufficient Wallet Balance. You need $${priceToPay.toFixed(2)} to purchase the ${selectedPlan} plan. Please top up your wallet.`);
 return;
 }

 if (!coverImage) {
 setError("A Cover Image is required.");
 return;
 }

 if (!kycConfirmed) {
 setError("You must confirm KYC verification requirements to submit a property.");
 return;
 }

 if (!formData.reservePrice || Number(formData.reservePrice) <= 0) {
 setError("A confidential reserve price is required.");
 return;
 }

 // Validate File Sizes (< 5MB)
 const MAX_SIZE = 5 * 1024 * 1024;
 if (coverImage && coverImage.size >= MAX_SIZE) {
   setError("Cover image exceeds 5MB size limit.");
   return;
 }
 if (floorPlanImage && floorPlanImage.size >= MAX_SIZE) {
   setError("Floor plan image exceeds 5MB size limit.");
   return;
 }
 const largeGalleryImage = galleryImages.find(f => f.size >= MAX_SIZE);
 if (largeGalleryImage) {
   setError(`Gallery image "${largeGalleryImage.name}" exceeds 5MB size limit.`);
   return;
 }

 setSubmitting(true);

 try {
  // 1. Prepare Cover Image Upload
  const coverRef = ref(storage, `properties/${user.uid}/${Date.now()}_cover_${coverImage.name}`);
  const coverPromise = uploadBytes(coverRef, coverImage).then(() => getDownloadURL(coverRef));

  // 2. Prepare Gallery Images Uploads
  const galleryPromises = galleryImages.map((file, i) => {
    const gRef = ref(storage, `properties/${user.uid}/${Date.now()}_gallery_${i}_${file.name}`);
    return uploadBytes(gRef, file).then(() => getDownloadURL(gRef));
  });

  // 2.5 Prepare Floor Plan Upload
  let floorPlanPromise: Promise<string | undefined> = Promise.resolve(undefined);
  if (floorPlanImage) {
    const fpRef = ref(storage, `properties/${user.uid}/${Date.now()}_floorplan_${floorPlanImage.name}`);
    floorPlanPromise = uploadBytes(fpRef, floorPlanImage).then(() => getDownloadURL(fpRef));
  }

  // 3. Execute all uploads in parallel for maximum speed
  const [coverUrl, galleryUrls, floorPlanUrl] = await Promise.all([
    coverPromise,
    Promise.all(galleryPromises),
    floorPlanPromise
  ]);

  const uploadedUrls = [coverUrl, ...galleryUrls];

 // 3. Auto-Geocode the Address
 let lat: number | undefined = undefined;
 let lng: number | undefined = undefined;
 try {
 const fullAddress = `${formData.address || ''}, ${formData.suburb || ''}, ${formData.city || ''}, New Zealand`.replace(/(^,\s*)|(,\s*,)/g, ', ');
 const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
 const geoData = await geoRes.json();
 if (geoData && geoData.length > 0) {
 lat = parseFloat(geoData[0].lat);
 lng = parseFloat(geoData[0].lon);
 }
 } catch (geoErr) {
 console.warn("Geocoding failed:", geoErr);
 }

 // 4. Create final property object
 const property = {
 title: formData.title,
 description: formData.description,
 price: Number(formData.price),
 reservePrice: Number(formData.reservePrice),
 listingType: formData.listingType,
 propertyType: formData.propertyType,
 address: formData.address,
 city: formData.city,
 suburb: formData.suburb,
 mapEmbed: formData.mapEmbed,
 bedrooms: Number(formData.bedrooms) || 0,
 bathrooms: Number(formData.bathrooms) || 0,
 parkingSpaces: formData.parkingSpaces ? Number(formData.parkingSpaces) : null,
 yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : null,
 area: Number(formData.area) || 0,
 amenities: selectedAmenities,
 images: uploadedUrls, 
 ...(floorPlanUrl !== undefined && { floorPlan: floorPlanUrl }),
 ...(lat !== undefined && { lat }),
 ...(lng !== undefined && { lng }),
 status: "pending", 
 ownerId: user.uid,
 createdAt: Date.now()
 };

 await purchaseListing(user.uid, property, selectedPlan, planPrices[selectedPlan]);

 // Send In-App Admin Notification
 await addDoc(collection(db, "notifications"), {
   userId: "admin_system",
   title: `New Property Submitted: ${user.displayName || 'A user'}`,
   message: `${user.displayName || 'A user'} (Ph: ${userData?.phone || 'N/A'}) submitted a new property: ${property.title} for review.`,
   type: "info",
   isRead: false,
   isPoppedUp: false,
   link: "/admin/properties",
   createdAt: Date.now()
 }).catch(err => console.error("Failed to create admin notification", err));

  if (user.email) {
    sendNotificationEmail({
      to: user.email,
      templateType: "userActionConfirmation",
      payload: {
        userName: user.displayName || "Valued Client",
        actionTitle: "Property Submitted for Review",
        actionMessage: "We have received your property submission and our premium brokerage team is currently reviewing it. We will notify you once it is live.",
        actionDetails: {
          "Property Title": property.title,
          "Price": `$${property.price}`,
          "Plan": selectedPlan
        },
        link: `${window.location.origin}/dashboard`
      }
    });
  }
 
 alert(`Property submitted successfully with ${selectedPlan} plan!`);
 router.push("/dashboard");
 } catch (err: any) {
 console.error(err);
 setError("Failed to submit property. " + err.message);
 } finally {
 setSubmitting(false);
 }
 };

 if (loading || !user) {
 return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold text-zinc-900">Loading...</div>;
 }

 return (
 <div className="bg-zinc-50 font-sans min-h-screen py-12">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <h1 className="text-4xl font-extrabold mb-4 text-zinc-900 tracking-tight">Post Your Property</h1>
 <p className="text-zinc-500 font-medium">Reach thousands of buyers across New Zealand. It only takes 5 minutes.</p>
 </div>
 
 <div className="bg-white rounded-3xl p-8 shadow-xl border border-zinc-200">
 
 {error && (
 <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-6">
 
 {/* BASICS */}
 <div className="space-y-6">
 <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">1. The Basics</h2>
 
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Property Title</label>
 <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Modern Villa with Ocean View" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
 </div>

 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Description</label>
 <textarea required name="description" value={formData.description} onChange={handleChange} rows={8} placeholder="Describe the best features of your property in detail..." className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900"></textarea>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Property Type</label>
 <select required name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900">
 <option>House</option>
 <option>Apartment</option>
 <option>Townhouse</option>
 <option>Villa</option>
 <option>Commercial</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Listing Type</label>
 <select required name="listingType" value={formData.listingType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900">
 <option>For Sale</option>
 <option>For Rent</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-6">
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Area (sqm)</label>
 <input required type="number" name="area" value={formData.area} onChange={handleChange} placeholder="120" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
 </div>
 </div>
 </div>

 {/* PRICING & DETAILS */}
 <div className="space-y-6">
 <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">2. Pricing & Identity (Confidential)</h2>
 
 <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 mb-6 flex items-start gap-3">
 <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
 <div>
 <p className="font-bold mb-1">Brokerage Confidentiality Guarantee</p>
 <p>Your reserve price and contact details are <strong>never</strong> shared with buyers. Our platform negotiates on your behalf.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Public Asking Price ($)</label>
 <input required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 850000" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
 </div>
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700 flex items-center justify-between">
 Hidden Reserve Price ($) <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Private</span>
 </label>
 <input required type="number" name="reservePrice" value={formData.reservePrice} onChange={handleChange} placeholder="e.g. 800000" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-blue-50/30 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-zinc-900" />
 </div>
 </div>
 
 <div className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl mt-4">
 <input 
 type="checkbox" 
 id="kyc" 
 checked={kycConfirmed} 
 onChange={(e) => setKycConfirmed(e.target.checked)}
 className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
 />
 <label htmlFor="kyc" className="text-sm text-zinc-700 font-medium cursor-pointer">
 I confirm that I will provide a valid Government ID and Address Proof to the platform administration upon request.
 </label>
 </div>
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Google Maps Embed Link (Optional fixed location)</label>
 <input type="text" name="mapEmbed" value={formData.mapEmbed} onChange={handleChange} placeholder="Paste src URL from Google Maps Embed" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
 </div>
 </div>

 {/* LOCATION & DETAILS */}
 <div className="space-y-6 pt-4">
 <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">3. Location & Layout</h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Street Address</label>
 <input required type="text" name="address" value={formData.address} onChange={handleChange} placeholder="e.g. 123 Beach Road" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">City / Region</label>
 <input required type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Auckland" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
 </div>
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Suburb</label>
 <input required type="text" name="suburb" value={formData.suburb} onChange={handleChange} placeholder="e.g. Herne Bay" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Bedrooms</label>
 <input required type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} placeholder="3" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
 </div>
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Bathrooms</label>
 <input required type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} placeholder="2" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Parking Spaces (Optional)</label>
 <input type="number" name="parkingSpaces" value={formData.parkingSpaces} onChange={handleChange} placeholder="2" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
 </div>
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Year Built (Optional)</label>
 <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} placeholder="2015" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
 </div>
 </div>
 </div>

 {/* AMENITIES */}
 <div className="space-y-6 pt-4">
 <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">3. Features & Amenities</h2>
 <div>
 <label className="block text-sm font-semibold mb-3 text-zinc-700">Select all that apply</label>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
 {[...AVAILABLE_AMENITIES, ...customAmenitiesList].map((amenity) => (
 <label key={amenity} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm font-medium ${selectedAmenities.includes(amenity) ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'}`}>
 <input 
 type="checkbox" 
 className="hidden" 
 checked={selectedAmenities.includes(amenity)}
 onChange={() => handleAmenityToggle(amenity)}
 />
 <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedAmenities.includes(amenity) ? 'border-zinc-700 bg-white' : 'border-zinc-300'}`}>
 {selectedAmenities.includes(amenity) && <div className="w-2 h-2 rounded-full bg-zinc-900"></div>}
 </span>
 {amenity}
 </label>
 ))}
 </div>

 <div className="flex items-center gap-2 max-w-sm mt-4">
 <input 
 type="text" 
 value={customAmenityInput} 
 onChange={(e) => setCustomAmenityInput(e.target.value)} 
 placeholder="Add custom amenity..." 
 className="flex-grow px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 text-sm"
 onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomAmenity(e as any) }}
 />
 <button 
 type="button" 
 onClick={handleAddCustomAmenity}
 className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm"
 >
 Add
 </button>
 </div>
 </div>
 </div>

 {/* MEDIA */}
 <div className="space-y-6 pt-4">
 <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">4. Media (Required)</h2>
 
 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Cover Image</label>
 <div 
 onClick={() => coverInputRef.current?.click()}
 className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
 coverImage ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
 }`}
 >
 <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={handleCoverChange} />
 {coverImage ? (
 <div className="relative w-full aspect-video rounded-xl overflow-hidden">
 <img src={URL.createObjectURL(coverImage)} alt="Cover preview" className="w-full h-full object-cover" />
 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
 <span className="text-white font-bold flex items-center gap-2"><Upload className="w-5 h-5"/> Change Cover</span>
 </div>
 </div>
 ) : (
 <div className="py-8 flex flex-col items-center justify-center text-zinc-500">
 <ImageIcon className="w-10 h-10 mb-3 text-zinc-400" />
 <p className="font-semibold text-zinc-700 mb-1">Click to upload cover image</p>
 </div>
 )}
 </div>
 </div>

 <div>
 <label className="block text-sm font-semibold mb-2 text-zinc-700">Floor Plan (Optional)</label>
 <div 
 onClick={() => floorPlanInputRef.current?.click()}
 className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
 floorPlanImage ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
 }`}
 >
 <input type="file" accept="image/*" className="hidden" ref={floorPlanInputRef} onChange={handleFloorPlanChange} />
 {floorPlanImage ? (
 <div className="relative w-full aspect-video rounded-xl overflow-hidden">
 <img src={URL.createObjectURL(floorPlanImage)} alt="Floor plan preview" className="w-full h-full object-contain" />
 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
 <span className="text-white font-bold flex items-center gap-2"><Upload className="w-5 h-5"/> Change Floor Plan</span>
 </div>
 </div>
 ) : (
 <div className="py-8 flex flex-col items-center justify-center text-zinc-500">
 <ImageIcon className="w-10 h-10 mb-3 text-zinc-400" />
 <p className="font-semibold text-zinc-700 mb-1">Click to upload floor plan image</p>
 </div>
 )}
 </div>
 </div>

 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="block text-sm font-semibold text-zinc-700">Property Gallery (Up to 25)</label>
 <span className="text-xs font-bold text-zinc-500">{galleryImages.length} / 25 added</span>
 </div>
 <div 
 onClick={() => { if (galleryImages.length < 25) galleryInputRef.current?.click(); }}
 className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
 galleryImages.length >= 25 ? 'opacity-50 cursor-not-allowed border-zinc-200' : 'cursor-pointer border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
 }`}
 >
 <input type="file" accept="image/*" multiple className="hidden" ref={galleryInputRef} onChange={handleGalleryChange} disabled={galleryImages.length >= 25} />
 <div className="flex flex-col items-center justify-center text-zinc-500 py-4">
 <Upload className="w-8 h-8 mb-2 text-zinc-400" />
 <p className="font-semibold text-zinc-700">Add Gallery Images</p>
 </div>
 </div>

 {galleryImages.length > 0 && (
 <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
 {galleryImages.map((file, idx) => (
 <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
 <img src={URL.createObjectURL(file)} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
 <button type="button" onClick={(e) => { e.stopPropagation(); removeGalleryImage(idx); }} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* LISTING PLAN */}
 <div className="space-y-6 pt-4 border-t border-zinc-100">
 <h2 className="text-xl font-bold text-zinc-900 pb-2">5. Choose Listing Plan</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div onClick={() => setSelectedPlan("Basic")} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === "Basic" ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300 bg-white'}`}>
 <h3 className="font-bold text-lg mb-1">Basic</h3>
 <p className="text-2xl font-extrabold text-zinc-900 mb-3">$0.50</p>
 <ul className="text-sm text-zinc-600 space-y-2"><li>• Standard Visibility</li><li>• Normal Search Rank</li></ul>
 </div>
 <div onClick={() => setSelectedPlan("Premium")} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedPlan === "Premium" ? 'border-blue-500 bg-blue-50' : 'border-zinc-200 hover:border-zinc-300 bg-white'}`}>
 {selectedPlan === "Premium" && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl">Selected</div>}
 <h3 className="font-bold text-lg mb-1">Premium</h3>
 <p className="text-2xl font-extrabold text-zinc-900 mb-3">$1.00</p>
 <ul className="text-sm text-zinc-600 space-y-2"><li>• Higher Ranking</li><li>• Premium Badge</li></ul>
 </div>
 <div onClick={() => setSelectedPlan("Featured")} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedPlan === "Featured" ? 'border-amber-500 bg-amber-50' : 'border-zinc-200 hover:border-zinc-300 bg-white'}`}>
 {selectedPlan === "Featured" && <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl">Selected</div>}
 <h3 className="font-bold text-lg mb-1">Featured</h3>
 <p className="text-2xl font-extrabold text-zinc-900 mb-3">$5.00</p>
 <ul className="text-sm text-zinc-600 space-y-2"><li>• Top Search Results</li><li>• Priority Recommendation</li><li>• Featured Badge</li></ul>
 </div>
 </div>
 <div className="bg-zinc-100 p-4 rounded-xl flex items-center justify-between">
 <span className="font-bold text-zinc-700">Your Wallet Balance:</span>
 <span className="text-xl font-extrabold text-zinc-900">${wallet?.balance.toFixed(2) || '0.00'}</span>
 </div>
 {wallet && wallet.balance < (selectedPlan === "Basic" ? 0.5 : selectedPlan === "Premium" ? 1 : 5) && (
 <div className="text-red-500 text-sm font-bold flex items-center justify-between">
 <span>Insufficient balance. You need ${(selectedPlan === "Basic" ? 0.5 : selectedPlan === "Premium" ? 1 : 5).toFixed(2)}.</span>
 <Link href="/dashboard/wallet" className="underline text-zinc-900 font-bold">Top Up Wallet</Link>
 </div>
 )}
 </div>

 <div className="pt-8 flex justify-end">
 <button type="submit" disabled={submitting} className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-lg w-full md:w-auto text-lg flex items-center justify-center gap-2">
 {submitting ? (
 <>
 <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 Publishing...
 </>
 ) : (
 `Pay With Wallet ($${(selectedPlan === "Basic" ? 0.5 : selectedPlan === "Premium" ? 1 : 5).toFixed(2)})`
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
}
