"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import { 
  LifeBuoy, 
  CheckCircle2, 
  Trash2, 
  Search, 
  Filter, 
  Mail, 
  Clock,
  MessageSquare,
  AlertCircle,
  Check,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminTicketsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user || (userData?.role !== "admin" && userData?.role !== "super_admin")) {
        router.push("/dashboard");
        return;
      }

      setFetching(true);
      const q = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTickets(fetchedTickets);
        setFetching(false);
      }, (error) => {
        console.error("Error fetching tickets:", error);
        toast.error("Failed to load Support Tickets");
        setFetching(false);
      });

      return () => unsubscribe();
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    let result = tickets;
    
    if (searchTerm) {
      result = result.filter(t => 
        t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      result = result.filter(t => t.status === statusFilter);
    }
    
    setFilteredTickets(result);
  }, [searchTerm, statusFilter, tickets]);

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setUpdatingId(ticketId);
    try {
      await updateDoc(doc(db, "support_tickets", ticketId), { status: newStatus });
      toast.success(`Ticket marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update ticket status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (window.confirm("Delete this support ticket permanently?")) {
      try {
        await deleteDoc(doc(db, "support_tickets", ticketId));
        toast.success("Ticket deleted");
      } catch {
        toast.error("Failed to delete ticket");
      }
    }
  };

  const statusColor: Record<string, string> = {
    open: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-emerald-100 text-emerald-700",
  };

  const borderColor: Record<string, string> = {
    open: "bg-amber-500",
    in_progress: "bg-blue-500",
    resolved: "bg-emerald-500",
  };

  if (loading || fetching) {
    return (
      <div className="flex-1 flex items-center justify-center h-[500px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-zinc-200 rounded mb-4"></div>
          <div className="text-sm text-zinc-500 font-medium">Loading Support Tickets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <LifeBuoy className="w-6 h-6" /> Support Tickets
        </h1>
        <p className="text-sm text-zinc-500 font-medium mt-1">
          Manage user issues, complaints, and help requests.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by email, subject, or message..." 
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
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 shadow-sm">
            <LifeBuoy className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
            <p className="font-medium">No tickets found matching your criteria.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div key={ticket.id} className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${borderColor[ticket.status] || "bg-zinc-300"}`}></div>

              <div className="flex flex-col lg:flex-row gap-6 pl-2">
                {/* Ticket Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2 flex-wrap">
                      {ticket.subject || "No Subject"}
                      <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${statusColor[ticket.status] || "bg-zinc-100 text-zinc-700"}`}>
                        {ticket.status?.replace("_", " ") || "Open"}
                      </span>
                    </h3>
                    <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 
                      {ticket.createdAt ? formatDistanceToNow(ticket.createdAt?.toDate ? ticket.createdAt.toDate() : ticket.createdAt, { addSuffix: true }) : "Unknown"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 mb-4">
                    <Mail className="w-4 h-4" /> {ticket.email || "Unknown User"}
                  </div>

                  {ticket.message && (
                    <div className="bg-zinc-50 rounded-lg p-3 text-sm text-zinc-700 border border-zinc-100 italic mb-3 whitespace-pre-wrap">
                      {ticket.message}
                    </div>
                  )}
                </div>

                <div className="hidden lg:block w-px bg-zinc-200"></div>

                {/* Actions */}
                <div className="lg:w-48 flex flex-col justify-center gap-2">
                  {ticket.status === 'open' && (
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                      disabled={updatingId === ticket.id}
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-3 rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {ticket.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                      disabled={updatingId === ticket.id}
                      className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold py-2 px-3 rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  )}
                  {ticket.status === 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'open')}
                      disabled={updatingId === ticket.id}
                      className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold py-2 px-3 rounded-lg border border-amber-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                    >
                      Re-open Ticket
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    disabled={updatingId === ticket.id}
                    className="w-full mt-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 px-3 rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
