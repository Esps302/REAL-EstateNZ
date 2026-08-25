"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocs, where, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { 
 UserCircle, 
 CheckCircle2, 
 Trash2, 
 Search, 
 Filter, 
 Mail, 
 Phone, 
 Building,
 Clock,
 RefreshCw,
 MessageSquare,
 X,
 Check,
 Loader2,
 FileText,
 Save
} from "lucide-react";
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function AdminCRMPage() {
 const { user, userData, loading } = useAuth();
 const router = useRouter();
 
 const [leads, setLeads] = useState<any[]>([]);
 const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
 const [fetching, setFetching] = useState(true);
 const [noteInput, setNoteInput] = useState<Record<string, string>>({});
 const [showNoteBox, setShowNoteBox] = useState<Record<string, boolean>>({});
 const [updatingId, setUpdatingId] = useState<string | null>(null);

 const [searchTerm, setSearchTerm] = useState("");
 const [statusFilter, setStatusFilter] = useState("all");

 useEffect(() => {
 if (!loading) {
 if (!user || (userData?.role !== "admin" && userData?.role !== "super_admin")) {
 router.push("/dashboard");
 return;
 }

 setFetching(true);
 const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
 
 const unsubscribe = onSnapshot(q, (snapshot) => {
 const fetchedLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 setLeads(fetchedLeads);
 setFetching(false);
 }, (error) => {
 console.error("Error fetching leads:", error);
 toast.error("Failed to load CRM leads");
 setFetching(false);
 });

 return () => unsubscribe();
 }
 }, [user, userData, loading, router]);

 useEffect(() => {
 let result = leads;
 
 if (searchTerm) {
 result = result.filter(l => 
 l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
 l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 l.propertyTitle?.toLowerCase().includes(searchTerm.toLowerCase())
 );
 }
 
 if (statusFilter !== "all") {
 result = result.filter(l => l.status === statusFilter);
 }
 
 setFilteredLeads(result);
 }, [searchTerm, statusFilter, leads]);

 const handleUpdateStatus = async (leadId: string, newStatus: string) => {
 setUpdatingId(leadId);
 try {
 await updateDoc(doc(db, "leads", leadId), { status: newStatus });
 toast.success(`Lead marked as ${newStatus.replace("_", " ")}`);

 // Notify user if they are registered
 const lead = leads.find(l => l.id === leadId);
 if (lead && lead.email) {
   const userQ = query(collection(db, "users"), where("email", "==", lead.email));
   const userSnap = await getDocs(userQ);
   
   if (!userSnap.empty) {
     const userId = userSnap.docs[0].id;
     await addDoc(collection(db, "notifications"), {
       userId,
       title: "Inquiry Update",
       message: `Your inquiry regarding ${lead.propertyTitle || 'a property'} has been marked as ${newStatus.replace("_", " ")}.`,
       type: "info",
       isRead: false,
       isPoppedUp: false,
       link: "",
       createdAt: Date.now()
     });

     sendNotificationEmail({
       to: lead.email,
       templateType: "adminNotificationToUser",
       payload: {
         userName: lead.name || "Valued Client",
         updateTitle: "Inquiry Update",
         updateMessage: `Your inquiry regarding ${lead.propertyTitle || 'a property'} has been updated by our team.`,
         status: newStatus.replace("_", " "),
         link: ""
       }
     });
   }
 }

 } catch {
 toast.error("Failed to update lead status");
 } finally {
 setUpdatingId(null);
 }
 };

 const handleSaveNote = async (leadId: string) => {
 const note = noteInput[leadId]?.trim();
 if (!note) return;
 try {
 await updateDoc(doc(db, "leads", leadId), { adminNote: note });
 toast.success("Note saved!");
 setShowNoteBox(prev => ({ ...prev, [leadId]: false }));
 setNoteInput(prev => ({ ...prev, [leadId]: "" }));
 } catch {
 toast.error("Failed to save note");
 }
 };

 const handleDelete = async (leadId: string) => {
 if (window.confirm("Delete this lead permanently?")) {
 try {
 await deleteDoc(doc(db, "leads", leadId));
 toast.success("Lead deleted");
 } catch {
 toast.error("Failed to delete lead");
 }
 }
 };

 const statusColor: Record<string, string> = {
 new:         "bg-blue-100 text-blue-700",
 contacted:   "bg-amber-100 text-amber-700",
 in_progress: "bg-purple-100 text-purple-700",
 resolved:    "bg-emerald-100 text-emerald-700",
 };

 const borderColor: Record<string, string> = {
 new:         "bg-blue-500",
 contacted:   "bg-amber-500",
 in_progress: "bg-purple-500",
 resolved:    "bg-emerald-500",
 };

 if (loading || fetching) {
 return (
 <div className="flex-1 flex items-center justify-center h-[500px]">
 <div className="animate-pulse flex flex-col items-center">
 <div className="h-8 w-32 bg-zinc-200 rounded mb-4"></div>
 <div className="text-sm text-zinc-500 font-medium">Loading CRM Data...</div>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6 max-w-7xl mx-auto">
 <div>
 <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
 <UserCircle className="w-6 h-6" /> Client CRM &amp; Leads
 </h1>
 <p className="text-sm text-zinc-500 font-medium mt-1">
 Manage incoming inquiries from prospective buyers and renters.
 </p>
 </div>

 {/* Filters */}
 <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
 <input 
 type="text" 
 placeholder="Search by name, email, or property..." 
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
 />
 </div>
 <div className="relative min-w-[200px]">
 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
 <select 
 value={statusFilter}
 onChange={e => setStatusFilter(e.target.value)}
 className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 appearance-none bg-white"
 >
 <option value="all">All Leads</option>
 <option value="new">New</option>
 <option value="contacted">Contacted</option>
 <option value="in_progress">In Progress</option>
 <option value="resolved">Resolved</option>
 </select>
 </div>
 </div>

 {/* Leads List */}
 <div className="grid grid-cols-1 gap-4">
 {filteredLeads.length === 0 ? (
 <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 shadow-sm">
 <UserCircle className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
 <p className="font-medium">No leads found matching your criteria.</p>
 </div>
 ) : (
 filteredLeads.map(lead => (
 <div key={lead.id} className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden">
 {/* Status bar */}
 <div className={`absolute top-0 left-0 w-1 h-full ${borderColor[lead.status] || "bg-zinc-300"}`}></div>

 <div className="flex flex-col lg:flex-row gap-6 pl-2">

 {/* Client Info */}
 <div className="flex-1">
 <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
 <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2 flex-wrap">
 {lead.name}
 <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${statusColor[lead.status] || "bg-zinc-100 text-zinc-700"}`}>
 {lead.status?.replace("_", " ")}
 </span>
 </h3>
 <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
 <Clock className="w-3.5 h-3.5" /> 
 {lead.createdAt ? formatDistanceToNow(lead.createdAt?.toDate ? lead.createdAt.toDate() : lead.createdAt, { addSuffix: true }) : "Unknown"}
 </span>
 </div>
 
 {/* Contact Buttons */}
 <div className="flex flex-wrap gap-2 mb-4">
 <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
 <Mail className="w-4 h-4" /> Email
 </a>
 {lead.phone && (
 <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors">
 <Phone className="w-4 h-4" /> Call
 </a>
 )}
 <button
 onClick={() => setShowNoteBox(prev => ({ ...prev, [lead.id]: !prev[lead.id] }))}
 className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
 >
 <MessageSquare className="w-4 h-4" /> {lead.adminNote ? "Edit Note" : "Add Note"}
 </button>
 </div>

 {/* Message */}
 {lead.message && (
 <div className="bg-zinc-50 rounded-lg p-3 text-sm text-zinc-700 border border-zinc-100 italic mb-3">
 "{lead.message}"
 </div>
 )}

 {/* Admin Note */}
 {lead.adminNote && !showNoteBox[lead.id] && (
 <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800 border border-amber-100 mb-3">
 <span className="font-bold text-xs uppercase tracking-wide">Admin Note: </span>{lead.adminNote}
 </div>
 )}

 {/* Note Input Box */}
 {showNoteBox[lead.id] && (
 <div className="flex gap-2 mt-2">
 <input
 type="text"
 placeholder="Write a note about this lead..."
 value={noteInput[lead.id] || lead.adminNote || ""}
 onChange={e => setNoteInput(prev => ({ ...prev, [lead.id]: e.target.value }))}
 className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
 onKeyDown={e => e.key === "Enter" && handleSaveNote(lead.id)}
 autoFocus
 />
 <button onClick={() => handleSaveNote(lead.id)} className="bg-zinc-900 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors">
 <Check className="w-4 h-4" />
 </button>
 <button onClick={() => setShowNoteBox(prev => ({ ...prev, [lead.id]: false }))} className="bg-zinc-100 text-zinc-500 px-3 py-2 rounded-lg hover:bg-zinc-200 transition-colors">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}
 </div>

 <div className="hidden lg:block w-px bg-zinc-200"></div>

 {/* Property & Actions */}
 <div className="lg:w-60 flex flex-col justify-between gap-4">
 <div>
 <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">
 {lead.leadType === 'agent' ? 'Request Details' : 'Inquired About'}
 </p>
 
 {lead.leadType === 'agent' ? (
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 w-fit rounded border border-indigo-100">
 <UserCircle className="w-4 h-4" /> Agent Request
 </div>
 {lead.interest && <span className="text-sm font-medium text-zinc-700">Looking to {lead.interest}</span>}
 {lead.preferredRegion && <span className="text-sm text-zinc-500">Prefers: {lead.preferredRegion}</span>}
 </div>
 ) : (
 lead.propertyId && (
 <Link href={`/property/${lead.propertyId}`} className="flex items-start gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
 <Building className="w-4 h-4 mt-0.5 shrink-0" />
 <span className="line-clamp-2">{lead.propertyTitle || "Unknown Property"}</span>
 </Link>
 )
 )}
 </div>

 {/* Action Buttons */}
 <div className="flex flex-col gap-2">
 {lead.status === 'new' && (
 <button
 onClick={() => handleUpdateStatus(lead.id, 'contacted')}
 disabled={updatingId === lead.id}
 className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold py-2 px-3 rounded-lg border border-amber-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
 >
 {updatingId === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Phone className="w-3.5 h-3.5" />}
 Mark as Contacted
 </button>
 )}
 {(lead.status === 'new' || lead.status === 'contacted') && (
 <button
 onClick={() => handleUpdateStatus(lead.id, 'in_progress')}
 disabled={updatingId === lead.id}
 className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold py-2 px-3 rounded-lg border border-purple-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
 >
 {updatingId === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Loader2 className="w-3.5 h-3.5" />}
 Mark In Progress
 </button>
 )}
 {lead.status !== 'resolved' && (
 <button
 onClick={() => handleUpdateStatus(lead.id, 'resolved')}
 disabled={updatingId === lead.id}
 className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold py-2 px-3 rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
 >
 {updatingId === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
 Mark Resolved
 </button>
 )}
 {lead.status === 'resolved' && (
 <button
 onClick={() => handleUpdateStatus(lead.id, 'new')}
 disabled={updatingId === lead.id}
 className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-3 rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
 >
 <RefreshCw className="w-3.5 h-3.5" /> Re-open Lead
 </button>
 )}
 <button
 onClick={() => handleDelete(lead.id)}
 disabled={updatingId === lead.id}
 className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 px-3 rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
 >
 <Trash2 className="w-3.5 h-3.5" /> Delete Lead
 </button>
 </div>
 </div>

 </div>
 </div>
 ))
 )}
 </div>
 </div>
 );
}
