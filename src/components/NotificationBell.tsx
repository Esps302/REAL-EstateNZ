"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Info, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from "firebase/firestore";
import { AppNotification } from "@/types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

const notificationAudio = typeof window !== "undefined" ? new Audio("/sounds/notification.mp3") : null;
if (notificationAudio) notificationAudio.preload = "auto";

export default function NotificationBell() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [userNotifications, setUserNotifications] = useState<AppNotification[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getTime = (val: any) => val?.toMillis ? val.toMillis() : (val?.toDate ? val.toDate().getTime() : (Number(val) || 0));
  const notifications = [...userNotifications, ...adminNotifications].sort((a: any, b: any) => getTime(b.createdAt) - getTime(a.createdAt));

  useEffect(() => {
    if (!user) {
      setUserNotifications([]);
      setAdminNotifications([]);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeUser = onSnapshot(q, (snapshot) => {
      const notifs: AppNotification[] = [];
      const newPopups: AppNotification[] = [];
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as AppNotification;
        // In case the ID isn't set inside the doc, grab from doc snap
        if (!data.id) data.id = docSnap.id;
        
        notifs.push(data);
        
        // If it hasn't been popped up yet, add to popups array
        if (!data.isPoppedUp) {
          newPopups.push(data);
        }
      });
      
      setUserNotifications(notifs);

      // Handle new popups (open menu instead)
      if (newPopups.length > 0) {
        setIsOpen(true);
        
        try {
          if (notificationAudio) {
            notificationAudio.currentTime = 0;
            notificationAudio.volume = 0.5;
            const p = notificationAudio.play();
            if (p) p.catch(() => {});
          }
        } catch(e) {}
        
        newPopups.forEach(p => {
          updateDoc(doc(db, "notifications", p.id), { isPoppedUp: true }).catch(console.error);
        });
      }
    });

    let unsubscribeAdmin: () => void;

    // If user is admin, also listen to 'admin_system' notifications
    if (userData?.role === 'admin' || userData?.role === 'super_admin') {
      const adminQ = query(
        collection(db, "notifications"),
        where("userId", "==", "admin_system"),
        orderBy("createdAt", "desc")
      );

      unsubscribeAdmin = onSnapshot(adminQ, (snapshot) => {
        const notifs: AppNotification[] = [];
        const newPopups: AppNotification[] = [];
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as AppNotification;
          if (!data.id) data.id = docSnap.id;
          
          notifs.push(data);
          
          // Check if this specific admin has popped it up.
          // Since there might be multiple admins, isPoppedUp isn't perfect for broadcast.
          // But for now, we use a simple array for read/popped state if it's admin broadcast.
          // Actually, for broadcast, let's keep it simple: if it's new, pop it.
          // To prevent multiple admins popping it, we might need an array `poppedBy`.
          // For now, let's just use the global `isPoppedUp` to not overcomplicate it.
          if (!data.isPoppedUp) {
            newPopups.push(data);
          }
        });
        
        setAdminNotifications(notifs);

        if (newPopups.length > 0) {
          setIsOpen(true);
          
          try {
            if (notificationAudio) {
              notificationAudio.currentTime = 0;
              notificationAudio.volume = 0.5;
              const p = notificationAudio.play();
              if (p) p.catch(() => {});
            }
          } catch(e) {}
          
          newPopups.forEach(p => {
            updateDoc(doc(db, "notifications", p.id), { isPoppedUp: true }).catch(console.error);
          });
        }
      });
    }

    return () => {
      unsubscribeUser();
      if (unsubscribeAdmin) unsubscribeAdmin();
    };
  }, [user, userData]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
    } catch(e) {
      console.error("Failed to mark as read", e);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) {
      await markAsRead(n.id);
    }
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-600 hover:text-zinc-900 transition-colors flex items-center justify-center rounded-full hover:bg-zinc-100"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-200 overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  You have no notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => { 
                      if (!notif.isRead) markAsRead(notif.id); 
                      setIsOpen(false); 
                      if (notif.link) router.push(notif.link);
                    }}
                    className={`p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div className="flex-1">
                      {notif.link ? (
                        <span className="font-bold text-sm text-zinc-900 hover:underline">
                          {notif.title}
                        </span>
                      ) : (
                        <p className="font-bold text-sm text-zinc-900">{notif.title}</p>
                      )}
                      <p className="text-sm text-zinc-600 mt-0.5 leading-snug">{notif.message}</p>
                      <p className="text-xs text-zinc-400 mt-1">{notif.createdAt ? formatDistanceToNow((notif.createdAt as any)?.toDate ? (notif.createdAt as any).toDate() : notif.createdAt, { addSuffix: true }) : ''}</p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
