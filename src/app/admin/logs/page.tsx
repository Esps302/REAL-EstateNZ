"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { 
  Activity, 
  Users, 
  Building, 
  FileText, 
  Mail,
  Clock,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface LogEvent {
  id: string;
  type: 'user' | 'property' | 'offer' | 'lead';
  title: string;
  description: string;
  createdAt: number;
  link?: string;
  icon: any;
  color: string;
  bg: string;
}

export default function AdminLogsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loading) {
      if (!user || (userData?.role !== "admin" && userData?.role !== "super_admin")) {
        router.push("/dashboard");
        return;
      }

      const fetchLogs = async () => {
        setFetching(true);
        try {
          const events: LogEvent[] = [];

          // Fetch recent users
          const usersSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50)));
          usersSnap.forEach(doc => {
            const data = doc.data();
            if (data.createdAt) {
              events.push({
                id: doc.id,
                type: 'user',
                title: "New User Registered",
                description: `${data.name || data.email} joined as a ${data.role || 'user'}.`,
                createdAt: data.createdAt,
                icon: Users,
                color: "text-blue-600",
                bg: "bg-blue-50"
              });
            }
          });

          // Fetch recent properties
          const propsSnap = await getDocs(query(collection(db, "properties"), orderBy("createdAt", "desc"), limit(50)));
          propsSnap.forEach(doc => {
            const data = doc.data();
            if (data.createdAt) {
              events.push({
                id: doc.id,
                type: 'property',
                title: `Property ${data.status === 'approved' ? 'Approved' : data.status === 'pending' ? 'Submitted for Review' : 'Rejected'}`,
                description: `${data.title || 'Untitled Property'} in ${data.city}`,
                createdAt: data.createdAt,
                link: `/admin/properties`,
                icon: Building,
                color: data.status === 'approved' ? "text-emerald-600" : data.status === 'pending' ? "text-amber-600" : "text-red-600",
                bg: data.status === 'approved' ? "bg-emerald-50" : data.status === 'pending' ? "bg-amber-50" : "bg-red-50"
              });
            }
          });

          // Fetch recent leads
          const leadsSnap = await getDocs(query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(50)));
          leadsSnap.forEach(doc => {
            const data = doc.data();
            if (data.createdAt) {
              // Handle Firestore serverTimestamp object or number
              const timestamp = data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt;
              events.push({
                id: doc.id,
                type: 'lead',
                title: `New CRM Lead: ${data.leadType === 'agent' ? 'Agent Request' : 'Service Request'}`,
                description: `${data.name} is looking to ${data.interest || 'get services'}.`,
                createdAt: timestamp,
                link: `/admin/crm`,
                icon: Mail,
                color: "text-indigo-600",
                bg: "bg-indigo-50"
              });
            }
          });

          // Sort all events globally by time
          events.sort((a, b) => b.createdAt - a.createdAt);
          setLogs(events.slice(0, 100)); // Keep top 100 recent events across platform

        } catch (error) {
          console.error("Error fetching logs:", error);
        } finally {
          setFetching(false);
        }
      };

      fetchLogs();
    }
  }, [user, userData, loading, router]);

  const filteredLogs = filter === "all" ? logs : logs.filter(l => l.type === filter);

  if (loading || fetching) {
    return (
      <div className="flex-1 flex items-center justify-center h-[500px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-zinc-200 rounded mb-4"></div>
          <div className="text-sm text-zinc-500 font-medium">Loading System Logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6" /> System Activity Logs
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            A unified timeline of all events happening across the platform.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Activity</option>
            <option value="user">User Registrations</option>
            <option value="property">Property Updates</option>
            <option value="lead">CRM Leads</option>
          </select>
        </div>
        <div className="text-sm font-medium text-zinc-500 ml-auto">
          Showing {filteredLogs.length} events
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-zinc-300 opacity-50" />
            <p>No system activity found for this filter.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-zinc-200"></div>
            
            <div className="space-y-8 relative">
              {filteredLogs.map((log, index) => {
                const Icon = log.icon;
                return (
                  <div key={index} className="flex gap-4 sm:gap-6 group">
                    <div className={`relative z-10 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${log.bg}`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${log.color}`} />
                    </div>
                    
                    <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl p-4 sm:p-5 group-hover:bg-white group-hover:border-zinc-200 group-hover:shadow-sm transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-zinc-900">{log.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 bg-white px-2.5 py-1 rounded-full border border-zinc-200 shrink-0 w-fit">
                          <Clock className="w-3 h-3" />
                          {log.createdAt ? formatDistanceToNow((log.createdAt as any)?.toDate ? (log.createdAt as any).toDate() : log.createdAt, { addSuffix: true }) : 'Unknown time'}
                        </div>
                      </div>
                      
                      <p className="text-sm text-zinc-600 mb-3">{log.description}</p>
                      
                      {log.link && (
                        <Link href={log.link} className="inline-flex text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                          View details &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
