"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import PropertyCard from "@/components/PropertyCard";
import { Property, User } from "@/types";
import { Phone, Mail, MapPin, ShieldCheck, Star, Building, Calendar, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AgentProfilePage({ params }: { params: { id: string } }) {
 const [agent, setAgent] = useState<User | null>(null);
 const [properties, setProperties] = useState<Property[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const router = useRouter();

 useEffect(() => {
 const fetchAgentAndProperties = async () => {
 try {
 // Fetch Agent Details
 const agentDocRef = doc(db, "users", params.id);
 const agentSnap = await getDoc(agentDocRef);
 
 if (!agentSnap.exists()) {
 setError("Agent not found");
 setLoading(false);
 return;
 }

 const agentData = { id: agentSnap.id, ...agentSnap.data() } as User;
 
 // Ensure the user is actually an agent/seller (optional depending on business logic, but good practice)
 if (!["agent", "seller", "admin", "super_admin"].includes(agentData.role)) {
 setError("User is not an agent");
 setLoading(false);
 return;
 }

 setAgent(agentData);

 // Fetch Agent's Active Properties
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
 } catch (err) {
 console.error("Error fetching agent profile:", err);
 setError("Failed to load agent profile");
 } finally {
 setLoading(false);
 }
 };

 fetchAgentAndProperties();
 }, [params.id]);

 if (loading) {
 return (
 <div className="min-h-screen bg-zinc-50 py-12 px-4">
 <div className="max-w-[1200px] mx-auto animate-pulse flex flex-col md:flex-row gap-8">
 <div className="w-full md:w-1/3 bg-zinc-200 h-[400px] rounded-2xl"></div>
 <div className="w-full md:w-2/3 bg-zinc-200 h-[400px] rounded-2xl"></div>
 </div>
 </div>
 );
 }

 if (error || !agent) {
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

 return (
 <div className="min-h-screen bg-zinc-50 py-12">
 <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
 
 {/* Agent Header Profile Card */}
 <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-zinc-200 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
 {/* Decorative background element */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-100 rounded-bl-full -z-10 opacity-50"></div>
 
 <div className="relative">
 <div className="w-32 h-32 md:w-48 md:h-48 bg-zinc-200 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-lg relative flex items-center justify-center">
 {agent.photoURL ? (
 <Image 
 src={agent.photoURL} 
 alt={agent.name} 
 fill 
 className="object-cover" 
 sizes="(max-width: 768px) 128px, 192px" 
 />
 ) : (
 <UserIcon className="w-16 h-16 md:w-24 md:h-24 text-zinc-400" />
 )}
 </div>
 {["admin", "super_admin", "agent"].includes(agent.role) && (
 <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-blue-500 text-white p-1.5 md:p-2 rounded-full border-4 border-white shadow-md" title="Verified Agent">
 <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
 </div>
 )}
 </div>
 
 <div className="flex-grow text-center md:text-left z-10 w-full">
 <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
 <div>
 <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight capitalize mb-1">
 {agent.name}
 </h1>
 <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mb-3">
 {agent.role.replace('_', ' ')}
 </p>
 <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-medium text-zinc-600">
 <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200 shadow-sm">
 <Star className="w-4 h-4 fill-current" /> 
 <span className="font-bold">4.9</span>
 <span className="opacity-80">(124 Reviews)</span>
 </div>
 <div className="flex items-center gap-1.5 text-zinc-500">
 <Calendar className="w-4 h-4" /> Joined {new Date(agent.createdAt).getFullYear()}
 </div>
 </div>
 </div>
 
 <div className="flex flex-col gap-2 min-w-[200px]">
 {agent.phone && !agent.privacy?.hidePhone && (
 <a href={`tel:${agent.phone}`} className="flex items-center justify-center md:justify-start gap-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-4 py-3 rounded-xl transition-colors text-zinc-900 font-semibold text-sm">
 <Phone className="w-4 h-4 text-zinc-400" /> {agent.phone}
 </a>
 )}
 <a href={`mailto:${agent.email}`} className="flex items-center justify-center md:justify-start gap-3 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-3 rounded-xl transition-colors font-semibold text-sm shadow-md">
 <Mail className="w-4 h-4" /> Contact Agent
 </a>
 </div>
 </div>

 {agent.location && (
 <div className="flex items-center justify-center md:justify-start gap-1.5 text-zinc-600 font-medium bg-zinc-100/80 w-max px-3 py-1.5 rounded-lg text-sm mx-auto md:mx-0">
 <MapPin className="w-4 h-4 text-zinc-400" /> Serving {agent.location}
 </div>
 )}
 </div>
 </div>

 {/* Agent Listings - Disabled for Brokerage Privacy */}
 <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 text-center mt-8">
 <ShieldCheck className="w-12 h-12 text-blue-400 mx-auto mb-3" />
 <h3 className="text-lg font-bold text-blue-900 mb-2">Brokerage Confidentiality</h3>
 <p className="text-blue-700/80 text-sm max-w-md mx-auto">
 To protect the privacy of our buyers and sellers, all property listings are managed centrally by the platform. You can browse all available properties in the main search directory.
 </p>
 </div>

 </div>
 </div>
 );
}
