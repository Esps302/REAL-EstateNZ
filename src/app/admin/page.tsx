"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
 Users, 
 Home, 
 DollarSign, 
 TrendingUp, 
 ArrowUpRight,
 ArrowDownRight,
  Building,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardOverview() {
 const { user, userData, loading } = useAuth();
 const router = useRouter();
 
 const [activeProperties, setActiveProperties] = useState(0);
 const [totalUsers, setTotalUsers] = useState(0);
 const [recentActivities, setRecentActivities] = useState<any[]>([]);
 const [chartData, setChartData] = useState<any[]>([]);
 const [fetching, setFetching] = useState(true);

 useEffect(() => {
 let unsubUsers: () => void;
 let unsubProps: () => void;
 let unsubNotifs: () => void;
 
 if (!loading) {
 if (!user || (userData?.role !== "admin" && userData?.role !== "super_admin")) {
 router.push("/dashboard");
 } else {
 setFetching(true);
 let currentUsers: any[] = [];
 let currentProps: any[] = [];
 let currentNotifs: any[] = [];

 const calculateDashboard = (users: any[], props: any[], notifs: any[]) => {
 setTotalUsers(users.length);
 setActiveProperties(props.length);
 
 const activities: any[] = [];
 
 let userCount = 0;
 users.forEach(data => {
 if (userCount < 5 && data.createdAt) {
 activities.push({
 id: data.id,
 type: 'user',
 title: "New user registered",
 desc: data.email || data.name || "Unknown user",
 time: data.createdAt,
 icon: Users,
 color: "text-blue-600",
 bg: "bg-blue-50"
 });
 userCount++;
 }
 });

 let propCount = 0;
 props.forEach(data => {
 if (propCount < 5 && data.createdAt) {
 activities.push({
 id: data.id,
 type: 'property',
 title: "New property listed",
 desc: data.title || "Untitled Property",
 time: data.createdAt,
 icon: Building,
 color: "text-indigo-600",
 bg: "bg-indigo-50"
 });
 propCount++;
 }
 });

 let notifCount = 0;
 notifs.forEach(data => {
 if (notifCount < 5 && data.createdAt) {
 activities.push({
 id: data.id,
 type: 'notification',
 title: data.title || "System Alert",
 desc: data.message || "New activity detected.",
 time: data.createdAt,
 icon: MessageSquare,
 color: data.type === 'success' ? "text-emerald-600" : "text-amber-600",
 bg: data.type === 'success' ? "bg-emerald-50" : "bg-amber-50"
 });
 notifCount++;
 }
 });

 activities.sort((a, b) => b.time - a.time);
 setRecentActivities(activities.slice(0, 8));

 const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
 const currentMonth = new Date().getMonth();
 const chartMap = new Map();
 
 for (let i = 5; i >= 0; i--) {
 let m = currentMonth - i;
 let y = new Date().getFullYear();
 if (m < 0) { m += 12; y -= 1; }
 chartMap.set(`${months[m]} ${y}`, { name: `${months[m]}`, users: 0, properties: 0 });
 }

 users.forEach(d => {
 if (d.createdAt) {
 const date = new Date(d.createdAt);
 const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
 if (chartMap.has(key)) {
 const entry = chartMap.get(key);
 entry.users += 1;
 chartMap.set(key, entry);
 }
 }
 });

 props.forEach(d => {
 if (d.createdAt) {
 const date = new Date(d.createdAt);
 const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
 if (chartMap.has(key)) {
 const entry = chartMap.get(key);
 entry.properties += 1;
 chartMap.set(key, entry);
 }
 }
 });

 setChartData(Array.from(chartMap.values()));
 setFetching(false);
 };

 unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snap) => {
 currentUsers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 calculateDashboard(currentUsers, currentProps, currentNotifs);
 });

 unsubProps = onSnapshot(query(collection(db, "properties"), orderBy("createdAt", "desc")), (snap) => {
 currentProps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 calculateDashboard(currentUsers, currentProps, currentNotifs);
 });

 unsubNotifs = onSnapshot(query(collection(db, "notifications"), where("userId", "==", "admin_system"), orderBy("createdAt", "desc")), (snap) => {
 currentNotifs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 calculateDashboard(currentUsers, currentProps, currentNotifs);
 });
 }
 }
 
 return () => {
 if (unsubUsers) unsubUsers();
 if (unsubProps) unsubProps();
 if (unsubNotifs) unsubNotifs();
 }
 }, [user, userData, loading, router]);

 const downloadReport = () => {
 const csvContent = "data:text/csv;charset=utf-8," 
 + "Metric,Value\n"
 + `Total Revenue,$0\n`
 + `Active Properties,${activeProperties}\n`
 + `Total Users,${totalUsers}\n`
 + `Conversion Rate,0.0%\n\n`
 + `Date Generated,${new Date().toLocaleString()}`;
 
 const encodedUri = encodeURI(csvContent);
 const link = document.createElement("a");
 link.setAttribute("href", encodedUri);
 link.setAttribute("download", `platform_report_${new Date().toISOString().split('T')[0]}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 if (loading || fetching) {
 return (
 <div className="flex-1 flex items-center justify-center h-full min-h-[500px]">
 <div className="animate-pulse flex flex-col items-center">
 <div className="h-8 w-32 bg-zinc-200 rounded mb-4"></div>
 <div className="text-sm text-zinc-500 font-medium">Loading Enterprise Data...</div>
 </div>
 </div>
 );
 }

 if (userData?.role !== "admin" && userData?.role !== "super_admin") return null;

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Overview</h1>
 <p className="text-sm text-zinc-500 font-medium mt-1">
 Track your enterprise metrics and platform performance.
 </p>
 </div>
 <div className="flex items-center gap-3">
 <button onClick={() => router.push('/admin/messages')} className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm flex items-center gap-2">
 <MessageSquare className="w-4 h-4" /> Inbox
 </button>
 <button onClick={downloadReport} className="px-4 py-2 bg-white border border-zinc-200 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm">
 Download Report
 </button>
 <button onClick={() => router.push('/sell')} className="px-4 py-2 bg-zinc-900 border border-transparent rounded-md text-sm font-medium text-white hover:bg-zinc-800 transition-colors shadow-sm">
 Create Listing
 </button>
 </div>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
 {[
 { name: "Total Revenue", value: "$0", change: "+0.0%", trend: "up", icon: DollarSign },
 { name: "Active Properties", value: activeProperties, change: "+100%", trend: "up", icon: Home },
 { name: "Total Users", value: totalUsers, change: "+100%", trend: "up", icon: Users },
 { name: "Conversion Rate", value: "0.0%", change: "0.0%", trend: "up", icon: TrendingUp }
 ].map((item, index) => {
 const Icon = item.icon;
 const isUp = item.trend === "up";
 
 return (
 <div key={item.name} className="bg-white overflow-hidden rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
 <div className="p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-zinc-500 truncate">{item.name}</p>
 <p className="mt-2 text-3xl font-bold text-zinc-900 tracking-tight">{item.value}</p>
 </div>
 <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
 <Icon className="h-5 w-5 text-zinc-700" />
 </div>
 </div>
 <div className="mt-4 flex items-center text-sm">
 <span className={`flex items-center font-semibold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
 {isUp ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
 {item.change}
 </span>
 <span className="ml-2 text-zinc-500 font-medium">from last month</span>
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* Main Dashboard Content Layout */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Graph */}
 <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm p-6 flex flex-col min-h-[400px]">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h2 className="text-base font-bold text-zinc-900">Platform Growth</h2>
 <p className="text-sm text-zinc-500 mt-1">Users vs Properties (Last 6 Months)</p>
 </div>
 <select className="text-sm border-zinc-200 rounded-md shadow-sm focus:border-zinc-900 focus:ring-zinc-900">
 <option>Last 6 Months</option>
 <option>This Year</option>
 </select>
 </div>
 <div className="flex-1 w-full mt-4 min-h-[300px]">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <defs>
 <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
 </linearGradient>
 <linearGradient id="colorProps" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
 <Tooltip 
 contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
 itemStyle={{ fontSize: '14px', fontWeight: 500 }}
 />
 <Area type="monotone" dataKey="users" name="New Users" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
 <Area type="monotone" dataKey="properties" name="New Properties" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProps)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Recent Activity */}
 <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 flex flex-col h-[400px]">
 <h2 className="text-base font-bold text-zinc-900 mb-6">Live Activity Feed</h2>
 
 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
 {recentActivities.length > 0 ? (
 <div className="space-y-6">
 {recentActivities.map((activity, i) => (
 <div key={i} className="flex gap-4 group">
 <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.bg} transition-transform group-hover:scale-110`}>
 <activity.icon className={`h-4 w-4 ${activity.color}`} />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-zinc-900 truncate">{activity.title}</p>
 <p className="text-sm text-zinc-500 mt-0.5 truncate">{activity.desc}</p>
 <p className="text-xs text-zinc-500 font-medium mt-1">
 {activity.time ? formatDistanceToNow((activity.time as any)?.toDate ? (activity.time as any).toDate() : activity.time, { addSuffix: true }) : 'Just now'}
 </p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center h-full text-zinc-400">
 <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
 <p className="text-sm font-medium">No recent activity</p>
 </div>
 )}
 </div>
 
 <button onClick={() => router.push('/admin/logs')} className="mt-6 w-full py-2.5 text-sm font-semibold text-zinc-900 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200 transition-colors shadow-sm">
 View Complete Logs
 </button>
 </div>
 </div>
 </div>
 );
}
