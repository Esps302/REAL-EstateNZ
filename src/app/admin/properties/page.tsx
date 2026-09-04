"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocs, addDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { 
 Building2, 
 CheckCircle2, 
 XCircle, 
 Trash2, 
 Search, 
 Filter, 
 ExternalLink,
 Eye,
 Edit
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";
import { formatCurrency } from "@/utils/formatCurrency";
import AdminPropertyPreviewModal from "@/components/AdminPropertyPreviewModal";

export default function AdminPropertiesPage() {
 const { user, userData, loading } = useAuth();
 const router = useRouter();
 
 const [properties, setProperties] = useState<any[]>([]);
 const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
 const [fetching, setFetching] = useState(true);
 const [previewProperty, setPreviewProperty] = useState<any>(null);
 
 const [searchTerm, setSearchTerm] = useState("");
 const [statusFilter, setStatusFilter] = useState("all");

 const fetchProperties = useCallback(async () => {
    setFetching(true);
    const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const props = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProperties(props);
    setFetching(false);
 }, []);

 useEffect(() => {
 if (!loading) {
 if (!user || (userData?.role !== "admin" && userData?.role !== "super_admin")) {
 router.push("/dashboard");
 return;
 }
 fetchProperties();
 }
 }, [user, userData, loading, router, fetchProperties]);

 useEffect(() => {
 let result = properties;
 
 if (searchTerm) {
 result = result.filter(p => 
 p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
 p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 p.id?.toLowerCase().includes(searchTerm.toLowerCase())
 );
 }
 
 if (statusFilter !== "all") {
 result = result.filter(p => p.status === statusFilter);
 }
 
 setFilteredProperties(result);
 }, [searchTerm, statusFilter, properties]);

 const handleUpdateStatus = async (propertyId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "properties", propertyId), {
        status: newStatus
      });
      
      const property = properties.find(p => p.id === propertyId);
      if (property && property.ownerId) {
        let title = '';
        let message = '';
        let type: 'success' | 'warning' | 'info' = 'info';

        if (newStatus === 'approved') {
          title = 'Property Approved!';
          message = `Your property "${property.title}" has been approved and is now live.`;
          type = 'success';
        } else if (newStatus === 'rejected') {
          title = 'Property Rejected';
          message = `Your property "${property.title}" was rejected. Please review our guidelines.`;
          type = 'warning';
        }

        if (title) {
          await addDoc(collection(db, "notifications"), {
            userId: property.ownerId,
            title,
            message,
            type,
            isRead: false,
            isPoppedUp: false,
            link: `/property/${propertyId}`,
            createdAt: Date.now()
          });

          // Fetch user details client-side to avoid firebase-admin dependency
          const userDoc = await getDoc(doc(db, "users", property.ownerId));
          const userData = userDoc.exists() ? userDoc.data() : null;

          if (userData?.email) {
            sendNotificationEmail({
              userId: property.ownerId,
              to: userData.email,
              templateType: "adminNotificationToUser",
              payload: {
                userName: userData.name || "Valued Client",
                updateTitle: title,
                updateMessage: message,
                status: newStatus,
                link: `${window.location.origin}/property/${propertyId}`
              }
            });
          }
        }
      }
      
      toast.success(`Property marked as ${newStatus}`);
      fetchProperties();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update property status");
    }
 };

 const handleDelete = async (propertyId: string) => {
    if (window.confirm("Are you sure you want to completely delete this property? This action cannot be undone.")) {
      try {
        const property = properties.find(p => p.id === propertyId);
        await deleteDoc(doc(db, "properties", propertyId));
        
        if (property && property.ownerId) {
          await addDoc(collection(db, "notifications"), {
            userId: property.ownerId,
            title: "Property Deleted",
            message: `Your property "${property.title}" has been permanently deleted by an administrator.`,
            type: 'warning',
            isRead: false,
            isPoppedUp: false,
            createdAt: Date.now()
          });

          const userDoc = await getDoc(doc(db, "users", property.ownerId));
          const userData = userDoc.exists() ? userDoc.data() : null;

          if (userData?.email) {
            sendNotificationEmail({
              userId: property.ownerId,
              to: userData.email,
              templateType: "adminNotificationToUser",
              payload: {
                userName: userData.name || "Valued Client",
                updateTitle: "Property Deleted",
                updateMessage: `Your property "${property.title}" has been permanently deleted by an administrator.`,
                status: "Deleted"
              }
            });
          }
        }

        toast.success("Property deleted permanently");
        fetchProperties();
      } catch (error) {
        console.error("Error deleting property:", error);
        toast.error("Failed to delete property");
      }
    }
 };

 if (loading || fetching) {
 return (
 <div className="flex-1 flex items-center justify-center h-[500px]">
 <div className="animate-pulse flex flex-col items-center">
 <div className="h-8 w-32 bg-zinc-200 rounded mb-4"></div>
 <div className="text-sm text-zinc-500 font-medium">Loading Properties...</div>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6 max-w-7xl mx-auto">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
 <Building2 className="w-6 h-6" /> Property Management
 </h1>
 <p className="text-sm text-zinc-500 font-medium mt-1">
 Approve, reject, and manage all property listings on the platform.
 </p>
 </div>
 </div>

 <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
 <input 
 type="text" 
 placeholder="Search by title, city, or ID..." 
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
 <option value="all">All Statuses</option>
 <option value="approved">Approved / Active</option>
 <option value="pending">Pending Approval</option>
 <option value="rejected">Rejected</option>
 </select>
 </div>
 </div>

 <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
 <tr>
 <th className="px-6 py-4">Listing</th>
 <th className="px-6 py-4">Price & Type</th>
 <th className="px-6 py-4">Location</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-zinc-100">
 {filteredProperties.length === 0 ? (
 <tr>
 <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
 No properties found matching your filters.
 </td>
 </tr>
 ) : (
 filteredProperties.map(property => (
 <tr key={property.id} className="hover:bg-zinc-50 transition-colors group">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-lg bg-zinc-200 overflow-hidden relative shrink-0">
 {property.images && property.images.length > 0 ? (
 <Image src={property.images[0]} alt="Property" fill className="object-cover" />
 ) : (
 <Building2 className="w-6 h-6 m-auto mt-3 text-zinc-400" />
 )}
 </div>
 <div>
 <div className="font-bold text-zinc-900 line-clamp-1 max-w-[200px]">{property.title || "Untitled Property"}</div>
 <div className="text-xs text-zinc-500 mt-0.5">ID: {property.id.substring(0, 8)}...</div>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="font-bold text-zinc-900">{formatCurrency(property.price, property.currency)}{property.listingType === 'For Rent' ? (property.rentFrequency === 'Monthly' ? ' / month' : ' / week') : ''}</div>
 <div className="text-xs text-zinc-500 mt-0.5">{property.listingType} &bull; {property.propertyType}</div>
 </td>
 <td className="px-6 py-4">
 <div className="font-medium text-zinc-900">{property.city}</div>
 <div className="text-xs text-zinc-500 mt-0.5">{property.suburb}</div>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
 property.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
 property.status === 'pending' ? 'bg-amber-100 text-amber-700' :
 'bg-red-100 text-red-700'
 }`}>
 {property.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
 property.status === 'pending' ? <span className="w-2 h-2 rounded-full bg-amber-500"></span> : 
 <XCircle className="w-3.5 h-3.5" />}
 <span className="capitalize">{property.status || "pending"}</span>
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <button onClick={() => setPreviewProperty(property)} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Quick Preview">
 <Eye className="w-4 h-4" />
 </button>
 
 <Link href={`/edit-property/${property.id}`} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Property">
 <Edit className="w-4 h-4" />
 </Link>
 
 <Link href={`/property/${property.id}`} target="_blank" className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Public Page">
 <ExternalLink className="w-4 h-4" />
 </Link>
 
 {property.status !== 'approved' && (
 <button onClick={() => handleUpdateStatus(property.id, 'approved')} className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
 <CheckCircle2 className="w-4 h-4" />
 </button>
 )}
 
 {property.status !== 'rejected' && (
 <button onClick={() => handleUpdateStatus(property.id, 'rejected')} className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Reject">
 <XCircle className="w-4 h-4" />
 </button>
 )}
 
 <div className="w-px h-4 bg-zinc-200 mx-1"></div>
 
 <button onClick={() => handleDelete(property.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Permanently">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 <AdminPropertyPreviewModal 
   property={previewProperty} 
   isOpen={!!previewProperty} 
   onClose={() => setPreviewProperty(null)}
   onApprove={() => handleUpdateStatus(previewProperty?.id, 'approved')}
   onReject={() => handleUpdateStatus(previewProperty?.id, 'rejected')}
 />

 </div>
 );
}
