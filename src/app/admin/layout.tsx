"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCircle,
  Settings,
  Search,
  Menu,
  X,
  ShieldAlert,
  CreditCard,
  Handshake,
  Calendar,
  LifeBuoy,
  MessageSquare,
  Loader2,
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Viewings', href: '/admin/viewings', icon: Calendar },
  { name: 'Offers & Negotiations', href: '/admin/offers', icon: Handshake },
  { name: 'Client CRM', href: '/admin/crm', icon: UserCircle },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Support Tickets', href: '/admin/tickets', icon: LifeBuoy },
  { name: 'Economy & Wallet', href: '/admin/economy', icon: CreditCard },
  { name: 'System Logs', href: '/admin/logs', icon: ShieldAlert },
  { name: 'Site Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAdmin =
    Boolean(user) &&
    (userData?.role === 'admin' || userData?.role === 'super_admin');

  // Guard admin layout so non-admins never see admin chrome or trigger Firestore permission errors
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace(user ? '/dashboard' : '/login');
    }
  }, [loading, isAdmin, user, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchFocused(false);
    setSearchQuery('');
  }, [pathname]);

  // Wire Ctrl+K / Cmd+K shortcut to focus admin quick-navigation search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      } else if (e.key === 'Escape') {
        setSearchFocused(false);
        setMobileMenuOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', 'admin_system'),
      where('isRead', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts: Record<string, number> = {};
      snapshot.docs.forEach((docSnap) => {
        const notif = docSnap.data();
        const link = notif.link || '';

        const adminPaths = [
          '/admin/viewings',
          '/admin/offers',
          '/admin/users',
          '/admin/crm',
          '/admin/properties',
          '/admin/economy',
          '/admin/logs',
          '/admin/messages',
          '/admin/tickets',
          '/admin/settings',
        ];

        const matched = adminPaths.find(
          (path) => link === path || link.startsWith(path + '/')
        );

        if (matched) {
          counts[matched] = (counts[matched] || 0) + 1;
        } else {
          if (link.includes('viewing')) counts['/admin/viewings'] = (counts['/admin/viewings'] || 0) + 1;
          else if (link.includes('offer') || link.includes('bid') || link.includes('auction')) counts['/admin/offers'] = (counts['/admin/offers'] || 0) + 1;
          else if (link.includes('user') || link.includes('register')) counts['/admin/users'] = (counts['/admin/users'] || 0) + 1;
          else if (link.includes('crm') || link.includes('service') || link.includes('agent') || link.includes('lead')) counts['/admin/crm'] = (counts['/admin/crm'] || 0) + 1;
          else if (link.includes('propert') || link.includes('sell')) counts['/admin/properties'] = (counts['/admin/properties'] || 0) + 1;
          else if (link.includes('ticket')) counts['/admin/tickets'] = (counts['/admin/tickets'] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !pathname) return;

    const markAsRead = async () => {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', 'admin_system'),
          where('isRead', '==', false)
        );
        const snap = await getDocs(q);
        const updatePromises: Promise<void>[] = [];

        snap.forEach((docSnap) => {
          const notif = docSnap.data();
          const link = notif.link || '';

          let matches = false;
          if (link === pathname || link.startsWith(pathname + '/')) {
            matches = true;
          } else {
            if (pathname === '/admin/viewings' && link.includes('viewing')) matches = true;
            else if (pathname === '/admin/offers' && (link.includes('offer') || link.includes('bid') || link.includes('auction'))) matches = true;
            else if (pathname === '/admin/users' && (link.includes('user') || link.includes('register'))) matches = true;
            else if (pathname === '/admin/crm' && (link.includes('crm') || link.includes('service') || link.includes('agent') || link.includes('lead'))) matches = true;
            else if (pathname === '/admin/properties' && (link.includes('propert') || link.includes('sell'))) matches = true;
            else if (pathname === '/admin/tickets' && link.includes('ticket')) matches = true;
          }

          if (matches) {
            updatePromises.push(updateDoc(doc(db, 'notifications', docSnap.id), { isRead: true }));
          }
        });

        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    };

    markAsRead();
  }, [pathname, isAdmin]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-zinc-700 font-medium gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Verifying admin access...
      </div>
    );
  }

  const filteredLinks = sidebarLinks.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const initials = (userData?.name || user?.displayName || 'Admin')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const renderSidebarNav = () => (
    <>
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
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">
              {userData?.name || 'Admin'}
            </p>
            <p className="text-xs text-zinc-500 truncate capitalize">
              {(userData?.role || 'admin').replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex-col sticky top-[65px] h-[calc(100vh-65px)] z-10 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-tighter">HB</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Admin Center</span>
          </Link>
        </div>
        {renderSidebarNav()}
      </aside>

      {/* Mobile Slide-Over Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10">
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm tracking-tighter">HB</span>
                </div>
                <span className="font-semibold text-lg tracking-tight">Admin Center</span>
              </Link>
              <button
                type="button"
                aria-label="Close admin menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-zinc-500 hover:text-zinc-900 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarNav()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sm:px-6 sticky top-[65px] z-20">
          <div className="flex items-center flex-1">
            <button
              type="button"
              aria-label="Open admin navigation"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 mr-2"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Navigation / Command Palette */}
            <div className="max-w-md w-full relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredLinks.length > 0) {
                    router.push(filteredLinks[0].href);
                    setSearchFocused(false);
                    setSearchQuery('');
                  }
                }}
                className="block w-full pl-10 pr-12 py-2 border border-zinc-200 rounded-md leading-5 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 sm:text-sm transition-colors"
                placeholder="Jump to admin section... (Ctrl+K)"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-zinc-400 text-xs font-medium border border-zinc-200 rounded px-1.5 py-0.5">
                  ⌘K
                </span>
              </div>

              {searchFocused && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden z-30">
                  {filteredLinks.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-zinc-500">No matching admin pages</div>
                  ) : (
                    filteredLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.href}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            router.push(item.href);
                            setSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          <Icon className="w-4 h-4 text-zinc-400" />
                          <span>{item.name}</span>
                          <span className="ml-auto text-xs text-zinc-400">{item.href}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block"
            >
              Exit Admin
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
