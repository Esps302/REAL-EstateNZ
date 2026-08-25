"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore';
import { 
 LayoutDashboard, 
 Users, 
 Building2, 
 UserCircle, 
 Settings, 
 LogOut,
 Bell,
 Search,
 Menu,
 PieChart,
 ShieldAlert,
 CreditCard,
 Handshake,
 Calendar
} from 'lucide-react';

 const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Viewings', href: '/admin/viewings', icon: Calendar },
  { name: 'Offers & Negotiations', href: '/admin/offers', icon: Handshake },
  { name: 'Client CRM', href: '/admin/crm', icon: UserCircle },
  { name: 'Economy & Wallet', href: '/admin/economy', icon: CreditCard },
  { name: 'System Logs', href: '/admin/logs', icon: ShieldAlert }
];

export default function AdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const pathname = usePathname();
 const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

 useEffect(() => {
   const q = query(collection(db, "notifications"), where("userId", "==", "admin_system"), where("isRead", "==", false));
   const unsubscribe = onSnapshot(q, (snapshot) => {
     const counts: Record<string, number> = {};
     snapshot.docs.forEach(doc => {
       const notif = doc.data();
       const link = notif.link || "";

       // Direct match: if the link IS an admin sidebar path, use it as category
       const adminPaths = [
         '/admin/viewings',
         '/admin/offers',
         '/admin/users',
         '/admin/crm',
         '/admin/properties',
         '/admin/economy',
         '/admin/logs',
         '/admin/messages',
       ];

       // Check if the link exactly matches or starts with a known admin path
       const matched = adminPaths.find(path => link === path || link.startsWith(path + '/'));

       if (matched) {
         counts[matched] = (counts[matched] || 0) + 1;
       } else {
         // Fallback: guess category from link content
         if (link.includes('viewing')) counts['/admin/viewings'] = (counts['/admin/viewings'] || 0) + 1;
         else if (link.includes('offer') || link.includes('bid') || link.includes('auction')) counts['/admin/offers'] = (counts['/admin/offers'] || 0) + 1;
         else if (link.includes('user') || link.includes('register')) counts['/admin/users'] = (counts['/admin/users'] || 0) + 1;
         else if (link.includes('crm') || link.includes('service') || link.includes('agent') || link.includes('lead')) counts['/admin/crm'] = (counts['/admin/crm'] || 0) + 1;
         else if (link.includes('propert') || link.includes('sell')) counts['/admin/properties'] = (counts['/admin/properties'] || 0) + 1;
       }
     });
     setUnreadCounts(counts);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Automatically mark notifications as read when visiting their respective admin page
    const markAsRead = async () => {
      if (!pathname) return;
      try {
        const q = query(
          collection(db, "notifications"), 
          where("userId", "==", "admin_system"), 
          where("isRead", "==", false)
        );
        const snap = await getDocs(q);
        const updatePromises: Promise<void>[] = [];
        
        snap.forEach((docSnap) => {
          const notif = docSnap.data();
          const link = notif.link || "";
          
          let matches = false;
          if (link === pathname || link.startsWith(pathname + '/')) {
            matches = true;
          } else {
            if (pathname === '/admin/viewings' && link.includes('viewing')) matches = true;
            else if (pathname === '/admin/offers' && (link.includes('offer') || link.includes('bid') || link.includes('auction'))) matches = true;
            else if (pathname === '/admin/users' && (link.includes('user') || link.includes('register'))) matches = true;
            else if (pathname === '/admin/crm' && (link.includes('crm') || link.includes('service') || link.includes('agent') || link.includes('lead'))) matches = true;
            else if (pathname === '/admin/properties' && (link.includes('propert') || link.includes('sell'))) matches = true;
          }

          if (matches) {
            updatePromises.push(updateDoc(doc(db, "notifications", docSnap.id), { isRead: true }));
          }
        });
        
        await Promise.all(updatePromises);
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    };

    markAsRead();
  }, [pathname]);

 return (
 <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans flex">
 {/* Sidebar - Vercel/Linear Style */}
 <aside className="w-64 border-r border-zinc-200 bg-white flex-col sticky top-[65px] h-[calc(100vh-65px)] z-10 hidden md:flex">
 <div className="h-16 flex items-center px-6 border-b border-zinc-200">
 <Link href="/admin" className="flex items-center gap-2">
 <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
 <span className="text-white font-bold text-sm tracking-tighter">NZ</span>
 </div>
 <span className="font-semibold text-lg tracking-tight">Admin Center</span>
 </Link>
 </div>

 <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
 {sidebarLinks.map((link) => {
 const Icon = link.icon;
 const isActive = pathname === link.href;
 return (
 <Link
 key={link.name}
 href={link.href}
 className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
 isActive 
 ? 'bg-zinc-100 text-zinc-900' 
 : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
 }`}
 >
 <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
 {link.name}
 {unreadCounts[link.href] > 0 && (
   <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
     {unreadCounts[link.href]}
   </span>
 )}
 </Link>
 );
 })}
 </nav>

 <div className="p-4 border-t border-zinc-200">
 <div className="flex items-center gap-3 px-3 py-2">
 <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
 SA
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-zinc-900 truncate">Super Admin</p>
 <p className="text-xs text-zinc-500 truncate">System Owner</p>
 </div>
 </div>
 </div>
 </aside>

 {/* Main Content Area */}
 <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
 {/* Topbar */}
 <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sm:px-6 sticky top-[65px] z-10">
 <div className="flex items-center flex-1">
 <button className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 mr-2">
 <Menu className="w-5 h-5" />
 </button>
 
 {/* Search / Command Palette Trigger */}
 <div className="max-w-md w-full relative hidden sm:block">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search className="h-4 w-4 text-zinc-400" />
 </div>
 <input
 type="text"
 className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-md leading-5 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 sm:text-sm transition-colors"
 placeholder="Search anything... (Ctrl+K)"
 />
 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
 <span className="text-zinc-400 text-xs font-medium border border-zinc-200 rounded px-1.5 py-0.5">⌘K</span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <Link href="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">
 Exit Admin
 </Link>
 </div>
 </header>

 {/* Page Content */}
 <main className="flex-1 overflow-y-auto p-4 sm:p-8">
 {children}
 </main>
 </div>
 </div>
 );
}
