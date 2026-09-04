"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Image as ImageIcon, Upload, X, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Property } from "@/types";

const AVAILABLE_AMENITIES = [
 "Air Conditioning", "Swimming Pool", "Balcony / Deck", "Gym / Fitness Center", 
 "Built-in Wardrobes", "Dishwasher", "Fenced Yard", "Furnished", 
 "Garage", "Heating", "Broadband / WiFi", "Pet Friendly", 
 "Security System", "Spa / Hot Tub", "Tennis Court", "Walk-in Closet", 
 "Ocean View", "Mountain View", "City Skyline View", "Solar Panels", 
 "Double Glazed Windows", "Elevator / Lift Access", "Fireplace", "Secure Parking", "Wheelchair Accessible"
];

const CURRENCIES = [
  "NZD", "USD", "EUR", "GBP", "AUD", "CAD", "CHF", "CNY", 
  "JPY", "INR", "SGD", "HKD", "ZAR", "AED", "SAR", "MXN", 
  "BRL", "RUB", "KRW", "SEK", "NOK", "DKK", "TRY", "THB",
  "IDR", "MYR", "PHP", "VND", "PLN", "ARS", "CLP", "COP"
];

export default function EditPropertyPage() {
 const { user, userData, loading: authLoading } = useAuth();
 const router = useRouter();
 const params = useParams();
 const propertyId = params?.id as string;

 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState("");
 const [originalProperty, setOriginalProperty] = useState<Property | null>(null);
 
 const [formData, setFormData] = useState({
   title: "",
   description: "",
   price: "",
   currency: "NZD",
   reservePrice: "",
   listingType: "For Sale",
   rentFrequency: "Weekly",
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

 const [existingImages, setExistingImages] = useState<string[]>([]);
 const [existingFloorPlan, setExistingFloorPlan] = useState<string | null>(null);
 
 const [galleryImages, setGalleryImages] = useState<File[]>([]);
 const [floorPlanImage, setFloorPlanImage] = useState<File | null>(null);

 const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
 const [customAmenityInput, setCustomAmenityInput] = useState("");
 const [customAmenitiesList, setCustomAmenitiesList] = useState<string[]>([]);

 const galleryInputRef = useRef<HTMLInputElement>(null);
 const floorPlanInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
   const fetchProperty = async () => {
     if (!propertyId || !user) return;
     try {
       const docRef = doc(db, "properties", propertyId);
       const docSnap = await getDoc(docRef);
       
       if (docSnap.exists()) {
         const data = docSnap.data() as Property;
         
         if (data.ownerId !== user.uid && userData?.role !== 'admin' && userData?.role !== 'super_admin') {
           router.push("/dashboard");
           return;
         }

         setOriginalProperty({ ...data, id: docSnap.id });
         
         setFormData({
           title: data.title || "",
           description: data.description || "",
           price: data.price?.toString() || "",
           currency: data.currency || "NZD",
           reservePrice: data.reservePrice?.toString() || "",
           listingType: data.listingType || "For Sale",
           rentFrequency: data.rentFrequency || "Weekly",
           propertyType: data.propertyType || "House",
           address: data.address || "",
           city: data.city || "",
           suburb: data.suburb || "",
           bedrooms: data.bedrooms?.toString() || "",
           bathrooms: data.bathrooms?.toString() || "",
           parkingSpaces: data.parkingSpaces?.toString() || "",
           yearBuilt: data.yearBuilt?.toString() || "",
           area: data.area?.toString() || "",
           mapEmbed: data.mapEmbed || "",
         });

         setExistingImages(data.images || []);
         setExistingFloorPlan(data.floorPlan || null);
         setSelectedAmenities(data.amenities || []);
         
         const customAms = (data.amenities || []).filter(a => !AVAILABLE_AMENITIES.includes(a));
         setCustomAmenitiesList(customAms);

       } else {
         setError("Property not found.");
       }
     } catch (err: any) {
       setError("Error loading property: " + err.message);
     } finally {
       setLoading(false);
     }
   };

   if (!authLoading && user && userData) {
     fetchProperty();
   } else if (!authLoading && !user) {
     router.push("/login");
   }
 }, [propertyId, user, userData, authLoading, router]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
   setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleAmenityToggle = (amenity: string) => {
   setSelectedAmenities(prev => 
     prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
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

 const handleFloorPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   if (e.target.files && e.target.files[0]) {
     setFloorPlanImage(e.target.files[0]);
   }
 };

 const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   if (e.target.files) {
     const newFiles = Array.from(e.target.files);
     const totalImages = existingImages.length + galleryImages.length + newFiles.length;
     if (totalImages > 25) {
       alert("You can only have up to 25 images in total.");
       return;
     }
     setGalleryImages(prev => [...prev, ...newFiles]);
   }
 };

 const removeExistingImage = (index: number) => {
   setExistingImages(prev => prev.filter((_, i) => i !== index));
 };

 const removeNewGalleryImage = (index: number) => {
   setGalleryImages(prev => prev.filter((_, i) => i !== index));
 };

 const removeExistingFloorPlan = () => {
   setExistingFloorPlan(null);
 };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setError("");

   if (!user) {
     setError("You must be logged in.");
     return;
   }

   const totalImagesCount = existingImages.length + galleryImages.length;
   if (totalImagesCount === 0) {
     setError("You must have at least one image (which acts as the cover).");
     return;
   }

   if (!formData.reservePrice || Number(formData.reservePrice) <= 0) {
     setError("A confidential reserve price is required.");
     return;
   }

   const MAX_SIZE = 5 * 1024 * 1024;
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
     const galleryPromises = galleryImages.map((file, i) => {
       const gRef = ref(storage, `properties/${user.uid}/${Date.now()}_gallery_${i}_${file.name}`);
       return uploadBytes(gRef, file).then(() => getDownloadURL(gRef));
     });

     let floorPlanPromise: Promise<string | undefined> = Promise.resolve(undefined);
     if (floorPlanImage) {
       const fpRef = ref(storage, `properties/${user.uid}/${Date.now()}_floorplan_${floorPlanImage.name}`);
       floorPlanPromise = uploadBytes(fpRef, floorPlanImage).then(() => getDownloadURL(fpRef));
     } else if (existingFloorPlan) {
       floorPlanPromise = Promise.resolve(existingFloorPlan);
     }

     const [newGalleryUrls, finalFloorPlanUrl] = await Promise.all([
       Promise.all(galleryPromises),
       floorPlanPromise
     ]);

     const allImageUrls = [...existingImages, ...newGalleryUrls];

     let lat = originalProperty?.lat;
     let lng = originalProperty?.lng;
     
     if (
       formData.address !== originalProperty?.address || 
       formData.city !== originalProperty?.city || 
       formData.suburb !== originalProperty?.suburb
     ) {
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
     }

     const updatedData = {
       title: formData.title,
       description: formData.description,
       price: Number(formData.price),
       currency: formData.currency,
       reservePrice: Number(formData.reservePrice),
       listingType: formData.listingType,
       ...(formData.listingType === "For Rent" && { rentFrequency: formData.rentFrequency }),
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
       images: allImageUrls, 
       floorPlan: finalFloorPlanUrl || null,
       ...(lat !== undefined && { lat }),
       ...(lng !== undefined && { lng }),
     };

     await updateDoc(doc(db, "properties", propertyId), updatedData);
     
     alert(`Property updated successfully!`);
     router.push(`/property/${propertyId}`);
   } catch (err: any) {
     console.error(err);
     setError("Failed to update property. " + err.message);
   } finally {
     setSubmitting(false);
   }
 };

 if (authLoading || loading) {
   return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold text-zinc-900">Loading Property...</div>;
 }

 if (!originalProperty) {
   return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold text-zinc-900">Property Not Found</div>;
 }

 return (
  <div className="bg-zinc-50 font-sans min-h-screen py-12">
   <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
     <div className="mb-6">
       <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-900 font-bold flex items-center gap-2">
         <ArrowLeft className="w-4 h-4" /> Back
       </button>
     </div>
     <div className="text-center mb-10">
       <h1 className="text-4xl font-extrabold mb-4 text-zinc-900 tracking-tight">Edit Property</h1>
       <p className="text-zinc-500 font-medium">Make changes to your existing listing.</p>
     </div>
     
     <div className="bg-white rounded-3xl p-8 shadow-xl border border-zinc-200">
       {error && (
         <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium">
           {error}
         </div>
       )}

       <form onSubmit={handleSubmit} className="space-y-6">
         
         <div className="space-y-6">
           <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">1. The Basics</h2>
           
           <div>
             <label className="block text-sm font-semibold mb-2 text-zinc-700">Property Title</label>
             <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
           </div>

           <div>
             <label className="block text-sm font-semibold mb-2 text-zinc-700">Description</label>
             <textarea required name="description" value={formData.description} onChange={handleChange} rows={8} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900"></textarea>
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
             {formData.listingType === "For Rent" && (
               <div>
                 <label className="block text-sm font-semibold mb-2 text-zinc-700">Rent Frequency</label>
                 <select required name="rentFrequency" value={formData.rentFrequency} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900">
                   <option value="Weekly">Weekly</option>
                   <option value="Monthly">Monthly</option>
                 </select>
               </div>
             )}
           </div>

           <div className="grid grid-cols-1 gap-6">
             <div>
               <label className="block text-sm font-semibold mb-2 text-zinc-700">Area (sqm)</label>
               <input required type="number" name="area" value={formData.area} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
             </div>
           </div>
         </div>

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
               <label className="block text-sm font-semibold mb-2 text-zinc-700">Public Asking Price</label>
               <div className="flex gap-2">
                 <select name="currency" value={formData.currency} onChange={handleChange} className="w-[110px] shrink-0 px-2 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 font-bold text-center appearance-none cursor-pointer">
                   {CURRENCIES.map(code => (
                     <option key={code} value={code}>{code}</option>
                   ))}
                 </select>
                 <input required type="number" name="price" value={formData.price} onChange={handleChange} className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
               </div>
             </div>
             <div>
               <label className="block text-sm font-semibold mb-2 text-zinc-700 flex items-center justify-between">
                 Hidden Reserve Price ($) <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Private</span>
               </label>
               <input required type="number" name="reservePrice" value={formData.reservePrice} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-blue-50/30 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-zinc-900" />
             </div>
           </div>
           
           <div>
             <label className="block text-sm font-semibold mb-2 text-zinc-700">Google Maps Embed Link (Optional)</label>
             <input type="text" name="mapEmbed" value={formData.mapEmbed} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
           </div>
         </div>

         <div className="space-y-6 pt-4">
           <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">3. Location & Layout</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-semibold mb-2 text-zinc-700">Street Address</label>
               <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-semibold mb-2 text-zinc-700">City / Region</label>
               <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
             </div>
             <div>
               <label className="block text-sm font-semibold mb-2 text-zinc-700">Suburb</label>
               <input required type="text" name="suburb" value={formData.suburb} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-semibold mb-2 text-zinc-700">Bedrooms</label>
               <input required type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
             </div>
             <div>
               <label className="block text-sm font-semibold mb-2 text-zinc-700">Bathrooms</label>
               <input required type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-semibold mb-2 text-zinc-700">Parking Spaces (Optional)</label>
               <input type="number" name="parkingSpaces" value={formData.parkingSpaces} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
             </div>
             <div>
               <label className="block text-sm font-semibold mb-2 text-zinc-700">Year Built (Optional)</label>
               <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900" />
             </div>
           </div>
         </div>

         <div className="space-y-6 pt-4">
           <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">3. Features & Amenities</h2>
           <div>
             <label className="block text-sm font-semibold mb-3 text-zinc-700">Select all that apply</label>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
               {[...AVAILABLE_AMENITIES, ...customAmenitiesList].map((amenity) => (
                 <label key={amenity} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm font-medium ${selectedAmenities.includes(amenity) ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'}`}>
                   <input type="checkbox" className="hidden" checked={selectedAmenities.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} />
                   <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedAmenities.includes(amenity) ? 'border-zinc-700 bg-white' : 'border-zinc-300'}`}>
                     {selectedAmenities.includes(amenity) && <div className="w-2 h-2 rounded-full bg-zinc-900"></div>}
                   </span>
                   {amenity}
                 </label>
               ))}
             </div>

             <div className="flex items-center gap-2 max-w-sm mt-4">
               <input type="text" value={customAmenityInput} onChange={(e) => setCustomAmenityInput(e.target.value)} placeholder="Add custom amenity..." className="flex-grow px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 text-sm" onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomAmenity(e as any) }} />
               <button type="button" onClick={handleAddCustomAmenity} className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm">Add</button>
             </div>
           </div>
         </div>

         <div className="space-y-6 pt-4">
           <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">4. Media</h2>
           
           <div>
             <label className="block text-sm font-semibold mb-2 text-zinc-700">Floor Plan (Optional)</label>
             <div className="flex gap-4">
                {existingFloorPlan && !floorPlanImage && (
                  <div className="relative w-32 aspect-video rounded-xl overflow-hidden border">
                    <img src={existingFloorPlan} alt="Existing Floor Plan" className="w-full h-full object-contain" />
                    <button type="button" onClick={removeExistingFloorPlan} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X className="w-3 h-3"/></button>
                  </div>
                )}
                <div onClick={() => floorPlanInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex-1 ${floorPlanImage ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'}`}>
                  <input type="file" accept="image/*" className="hidden" ref={floorPlanInputRef} onChange={handleFloorPlanChange} />
                  {floorPlanImage ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                      <img src={URL.createObjectURL(floorPlanImage)} alt="Floor plan preview" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <Upload className="w-6 h-6 mb-2 text-zinc-400" />
                      <p className="font-semibold text-sm">Upload New Floor Plan</p>
                    </div>
                  )}
                </div>
             </div>
           </div>

           <div>
             <div className="flex items-center justify-between mb-2">
               <label className="block text-sm font-semibold text-zinc-700">Property Images (Max 25)</label>
               <span className="text-xs font-bold text-zinc-500">{existingImages.length + galleryImages.length} / 25</span>
             </div>
             
             {existingImages.length > 0 && (
               <div className="mb-4">
                 <p className="text-xs text-zinc-500 mb-2 font-bold">Existing Images (The first image is your cover)</p>
                 <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                   {existingImages.map((img, idx) => (
                     <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-zinc-200">
                       <img src={img} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                       <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             <div onClick={() => { if (existingImages.length + galleryImages.length < 25) galleryInputRef.current?.click(); }} className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${existingImages.length + galleryImages.length >= 25 ? 'opacity-50 cursor-not-allowed border-zinc-200' : 'cursor-pointer border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'}`}>
               <input type="file" accept="image/*" multiple className="hidden" ref={galleryInputRef} onChange={handleGalleryChange} disabled={existingImages.length + galleryImages.length >= 25} />
               <div className="flex flex-col items-center justify-center text-zinc-500 py-4">
                 <Upload className="w-8 h-8 mb-2 text-zinc-400" />
                 <p className="font-semibold text-zinc-700">Add New Images</p>
               </div>
             </div>

             {galleryImages.length > 0 && (
               <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                 {galleryImages.map((file, idx) => (
                   <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                     <img src={URL.createObjectURL(file)} alt={`New Gallery ${idx}`} className="w-full h-full object-cover" />
                     <button type="button" onClick={() => removeNewGalleryImage(idx)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>

         <div className="pt-8 flex justify-end">
           <button type="submit" disabled={submitting} className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-lg w-full md:w-auto text-lg flex items-center justify-center gap-2">
             {submitting ? (
               <>
                 <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Saving...
               </>
             ) : (
               "Save Changes"
             )}
           </button>
         </div>
       </form>
     </div>
   </div>
 </div>
 );
}
