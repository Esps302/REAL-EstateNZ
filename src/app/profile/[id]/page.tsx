"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import PropertyCard from "@/components/PropertyCard";
import { Property, User } from "@/types";
import { Phone, Mail, MapPin, ShieldCheck, Calendar, User as UserIcon, Building, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PublicProfilePage({ params }: { params: { id: string } }) {
 const [profileUser, setProfileUser] = useState<User | null>(null);
 const [properties, setProperties] = useState<Property[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const router = useRouter();

 useEffect(() => {
 const fetchUserAndProperties = async () => {
 try {
 const userDocRef = doc(db, "users", params.id);
 const userSnap = await getDoc(userDocRef);
 
 if (!userSnap.exists()) {
 setError("User not found");
 setLoading(false);
 return;
 }

 const userData = { id: userSnap.id, ...userSnap.data() } as User;
 
 // Respect privacy settings
 if (userData.privacy?.publicProfile === false) {
 setError("This profile is private");
 setLoading(false);
 return;
 }

 setProfileUser(userData);

 // Fetch user's active properties if they are a seller, agent, or admin
 if (["seller", "agent", "admin", "super_admin"].includes(userData.role)) {
 const propertiesQuery = query(
 collection(db, "properties"),
 where("ownerId", "==", params.id),
 where("status", "==", "approved")
 );
 const propertiesSnap = await getDocs(propertiesQuery);
 const fetchedProperties = propertiesSnap.docs.map(
 (doc) => ({ id: doc.id, ...doc.data() } as Property)
 );
 setProperties(fetchedProperties);
 }
 } catch (err) {
 console.error("Error fetching user profile:", err);
 setError("Failed to load user profile");
 } finally {
 setLoading(false);
 }
 };

 fetchUserAndProperties();
 }, [params.id]);

 if (loading) {
 return (
 <div className="min-h-screen bg-zinc-50 py-12 px-4">
 <div className="max-w-[1200px] mx-auto animate-pulse flex flex-col md:flex-row gap-8">
 <div className="w-full md:w-1/3 bg-zinc-200 h-[300px] rounded-2xl"></div>
 <div className="w-full md:w-2/3 bg-zinc-200 h-[300px] rounded-2xl"></div>
 </div>
 </div>
 );
 }

 if (error || !profileUser) {
 return (
 <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
 <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 text-center max-w-sm">
 <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <UserIcon className="w-8 h-8 text-zinc-400" />
 </div>
 <h1 className="text-xl font-bold text-zinc-900 mb-2">{error}</h1>
 <button onClick={() => router.push("/")} className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-lg font-bold transition-all w-full text-sm">
 Go Home
 </button>
 </div>
 </div>
 );
 }

 const isVerified = ["admin", "super_admin", "agent", "seller"].includes(profileUser.role);

 return (
 <div className="min-h-screen bg-zinc-50 py-12">
 <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
 
 {/* Profile Header Card */}
 <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-zinc-200 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-zinc-800 to-zinc-400 opacity-10"></div>
 
 <div className="relative z-10">
 <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-100 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-lg relative flex items-center justify-center">
 {profileUser.photoURL ? (
 <Image 
 src={profileUser.photoURL} 
 alt={profileUser.name} 
 fill 
 className="object-cover" 
 sizes="(max-width: 768px) 128px, 160px" 
 />
 ) : (
 <UserIcon className="w-16 h-16 md:w-20 md:h-20 text-zinc-300" />
 )}
 </div>
 {isVerified && (
 <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white shadow-md" title="Verified User">
 <ShieldCheck className="w-5 h-5" />
 </div>
 )}
 </div>
 
 <div className="flex-grow text-center md:text-left z-10 w-full mt-2">
 <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
 <div>
 <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight capitalize mb-1">
 {profileUser.name || "Anonymous User"}
 </h1>
 <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
 profileUser.role === 'super_admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
 profileUser.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
 profileUser.role === 'agent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
 profileUser.role === 'seller' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
 'bg-zinc-100 text-zinc-700 border-zinc-200'
 }`}>
 {profileUser.role === 'super_admin' && <Shield className="w-3 h-3 inline mr-1" />}
 {profileUser.role.replace('_', ' ')}
 </span>
 </div>
 
 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-zinc-600">
 <div className="flex items-center gap-1.5 text-zinc-500">
 <Calendar className="w-4 h-4" /> Joined {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Unknown'}
 </div>
 {profileUser.location && (
 <div className="flex items-center gap-1.5 text-zinc-500">
 <MapPin className="w-4 h-4" /> {profileUser.location}
 </div>
 )}
 </div>
 </div>
 
 <div className="flex flex-col gap-2 min-w-[200px]">
 {profileUser.phone && !profileUser.privacy?.hidePhone && (
 <a href={`tel:${profileUser.phone}`} className="flex items-center justify-center md:justify-start gap-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-4 py-3 rounded-xl transition-colors text-zinc-900 font-semibold text-sm">
 <Phone className="w-4 h-4 text-zinc-400" /> {profileUser.phone}
 </a>
 )}
 <a href={`mailto:${profileUser.email}`} className="flex items-center justify-center md:justify-start gap-3 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-3 rounded-xl transition-colors font-semibold text-sm shadow-md">
 <Mail className="w-4 h-4" /> Message
 </a>
 </div>
 </div>
 </div>
 </div>

 {/* User Listings - Disabled for Brokerage Privacy */}
 {["seller", "agent", "admin", "super_admin"].includes(profileUser.role) && (
 <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 text-center mt-8">
 <ShieldCheck className="w-12 h-12 text-blue-400 mx-auto mb-3" />
 <h3 className="text-lg font-bold text-blue-900 mb-2">Brokerage Confidentiality</h3>
 <p className="text-blue-700/80 text-sm max-w-md mx-auto">
 To protect the privacy of our buyers and sellers, all property listings are managed centrally by the platform. You can browse all available properties in the main search directory.
 </p>
 </div>
 )}

 </div>
 </div>
 );
}
