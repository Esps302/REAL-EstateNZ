"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocs, where, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Trash2, Phone, Mail, RotateCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";

interface Viewing {
  id: string;
  propertyId: string;
  propertyTitle: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: number;
}

export default function AdminViewingsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || (userData?.role !== "admin" && userData?.role !== "super_admin")) {
        router.push("/dashboard");
      }
    }
  }, [user, userData, authLoading, router]);

  useEffect(() => {
    if (userData?.role !== "admin" && userData?.role !== "super_admin") return;

    const q = query(
      collection(db, "viewings"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data: Viewing[] = [];
      snap.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as Viewing);
      });
      setViewings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  const handleUpdateStatus = async (id: string, status: "confirmed" | "cancelled" | "pending") => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "viewings", id), { status });
      toast.success(`Viewing marked as ${status}`);

      // Notify the user if they are registered
      const viewing = viewings.find(v => v.id === id);
      if (viewing && viewing.email) {
        const userQ = query(collection(db, "users"), where("email", "==", viewing.email));
        const userSnap = await getDocs(userQ);
        
        if (!userSnap.empty) {
          const userId = userSnap.docs[0].id;
          await addDoc(collection(db, "notifications"), {
            userId,
            title: "Viewing Appointment Update",
            message: `Your viewing for ${viewing.propertyTitle || 'a property'} on ${viewing.date} at ${viewing.time} has been ${status}.`,
            type: status === 'confirmed' ? 'success' : (status === 'cancelled' ? 'warning' : 'info'),
            isRead: false,
            isPoppedUp: false,
            link: "",
            createdAt: Date.now()
          });

          sendNotificationEmail({
            to: viewing.email,
            templateType: "adminNotificationToUser",
            payload: {
              userName: viewing.name || "Valued Client",
              updateTitle: "Viewing Appointment Update",
              updateMessage: `Your viewing appointment for ${viewing.propertyTitle || 'a property'} on ${viewing.date} at ${viewing.time} has been updated.`,
              status: status,
              link: ""
            }
          });
        }
      }

    } catch (error) {
      console.error("Error updating viewing status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this viewing permanently?")) {
      try {
        await deleteDoc(doc(db, "viewings", id));
        toast.success("Viewing deleted successfully");
      } catch (error) {
        console.error("Error deleting viewing:", error);
        toast.error("Failed to delete viewing");
      }
    }
  };

  const safeDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; // Return original if invalid
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (authLoading || loading) {
    return <div className="flex-1 flex items-center justify-center h-screen">Loading viewings...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#0073e6]" />
          Viewing Appointments
        </h1>
        <p className="text-sm text-zinc-500 font-medium mt-1">
          Manage and confirm scheduled property viewings.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {viewings.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Calendar className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
            <p className="font-semibold text-zinc-700">No viewings scheduled yet.</p>
            <p className="text-sm">When buyers schedule a viewing, it will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Client / Contact</th>
                  <th className="px-6 py-4 font-bold">Property</th>
                  <th className="px-6 py-4 font-bold">Date & Time</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {viewings.map((viewing) => (
                  <tr key={viewing.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">{viewing.name}</div>
                      <div className="flex flex-col gap-1 mt-1">
                        <a href={`mailto:${viewing.email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {viewing.email}
                        </a>
                        <a href={`tel:${viewing.phone}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {viewing.phone}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/property/${viewing.propertyId}`} 
                        className="font-medium text-[#0073e6] hover:underline flex items-start gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2 max-w-[200px]">{viewing.propertyTitle}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {safeDate(viewing.date)}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {viewing.time || 'Not specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {viewing.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      )}
                      {viewing.status === "confirmed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                        </span>
                      )}
                      {viewing.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {viewing.status === "pending" && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(viewing.id, "confirmed")}
                              disabled={updatingId === viewing.id}
                              className="text-xs font-bold bg-[#0073e6] hover:bg-[#005bb5] text-white px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(viewing.id, "cancelled")}
                              disabled={updatingId === viewing.id}
                              className="text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {viewing.status === "confirmed" && (
                          <button 
                            onClick={() => handleUpdateStatus(viewing.id, "cancelled")}
                            disabled={updatingId === viewing.id}
                            className="text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                        {viewing.status === "cancelled" && (
                          <button 
                            onClick={() => handleUpdateStatus(viewing.id, "pending")}
                            disabled={updatingId === viewing.id}
                            className="flex items-center gap-1 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" /> Re-open
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(viewing.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                          title="Delete Viewing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
