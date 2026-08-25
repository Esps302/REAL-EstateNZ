"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import PropertyCard from "@/components/PropertyCard";
import { Property } from "@/types";
import { Heart, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SavedPropertiesPage() {
 const { user, userData, loading: authLoading } = useAuth();
 const [properties, setProperties] = useState<Property[]>([]);
 const [loading, setLoading] = useState(true);
 const router = useRouter();

 useEffect(() => {
 if (!authLoading && !user) {
 router.push("/login");
 }
 }, [user, authLoading, router]);

 useEffect(() => {
 const fetchSavedProperties = async () => {
 if (!userData?.savedProperties || userData.savedProperties.length === 0) {
 setProperties([]);
 setLoading(false);
 return;
 }

 try {
 const promises = userData.savedProperties.map((id) =>
 getDoc(doc(db, "properties", id))
 );
 const docs = await Promise.all(promises);
 const fetchedProperties = docs
 .filter((doc) => doc.exists())
 .map((doc) => ({ id: doc.id, ...doc.data() } as Property));
 
 setProperties(fetchedProperties);
 } catch (error) {
 console.error("Error fetching saved properties:", error);
 } finally {
 setLoading(false);
 }
 };

 if (userData) {
 fetchSavedProperties();
 }
 }, [userData]);

 if (authLoading || loading) {
 return (
 <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
 <div className="animate-pulse flex flex-col items-center">
 <div className="w-12 h-12 bg-zinc-200 rounded-full mb-4"></div>
 <div className="h-4 w-32 bg-zinc-200 rounded"></div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-zinc-50 py-12">
 <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center gap-3 mb-8">
 <div className="p-3 bg-red-100 text-red-500 rounded-xl">
 <Heart className="w-6 h-6 fill-current" />
 </div>
 <div>
 <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Saved Properties</h1>
 <p className="text-zinc-500 font-medium">Your personal collection of favorite homes.</p>
 </div>
 </div>

 {properties.length === 0 ? (
 <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200 shadow-sm flex flex-col items-center">
 <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
 <Heart className="w-10 h-10 text-zinc-300" />
 </div>
 <h2 className="text-xl font-bold text-zinc-900 mb-2">No saved properties yet</h2>
 <p className="text-zinc-500 max-w-md mx-auto mb-8">
 Keep track of the homes you love by clicking the heart icon on any property. They will appear here for easy access.
 </p>
 <Link 
 href="/search" 
 className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md flex items-center gap-2"
 >
 <Search className="w-4 h-4" /> Browse Properties
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {properties.map((property) => (
 <PropertyCard key={property.id} property={property} />
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
