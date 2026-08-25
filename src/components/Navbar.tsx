"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, UserCircle, Menu, LogOut, Loader2, Home, Building, ShieldCheck } from "@/components/Icons";
import { LayoutDashboard, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import AgentModal from "@/components/AgentModal";
import Image from "next/image";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const pathname = usePathname();
  const { user, userData, wallet, loading: authLoading } = useAuth();

  const [isSigningOut, setIsSigningOut] = useState(false);
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

 const handleSignOut = async () => {
 setIsSigningOut(true);
 try {
 // Small delay for the animation
 setTimeout(async () => {
 await signOut(auth);
 setIsSigningOut(false);
 }, 350);
 } catch (error) {
 console.error("Failed to sign out", error);
 setIsSigningOut(false);
 }
 };

  const isExpandedMenu = user && (userData?.role === 'seller' || userData?.role === 'admin' || userData?.role === 'super_admin');

  return (
  <>
  <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200 w-full transition-all">
  <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
  <div className="flex items-center justify-between h-[4.5rem] lg:h-20 w-full gap-4">
 
 {/* Left Section - Navigation Links */}
 <motion.div 
 layout
 transition={{ type: "spring", stiffness: 400, damping: 30 }}
 className={`${!isExpandedMenu ? "flex-1 min-w-0" : ""} flex justify-start items-center hidden md:flex md:gap-1 lg:gap-3`}
 >
 <Link href="/search?type=buy" className="text-zinc-900 hover:text-zinc-600 px-2 py-2 text-[12px] lg:text-[13.5px] font-bold whitespace-nowrap transition-colors">For sale</Link>
 <Link href="/search?type=rent" className="text-zinc-900 hover:text-zinc-600 px-2 py-2 text-[12px] lg:text-[13.5px] font-bold whitespace-nowrap transition-colors">For rent</Link>
 <Link href="/smart-match" className="text-pink-600 hover:text-pink-500 px-2 py-2 text-[12px] lg:text-[13.5px] font-extrabold whitespace-nowrap transition-colors flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-current"/> Smart Match</Link>
 <button onClick={() => setIsAgentModalOpen(true)} className="text-zinc-900 hover:text-zinc-600 px-2 py-2 text-[12px] lg:text-[13.5px] font-bold whitespace-nowrap transition-colors">Find an agent</button>
 {user && (userData?.role === 'seller' || userData?.role === 'admin' || userData?.role === 'super_admin') && (
 <Link href="/sell" className="text-zinc-900 hover:text-zinc-600 px-2 py-2 text-[12px] lg:text-[13.5px] font-bold whitespace-nowrap transition-colors">Sell</Link>
 )}
 </motion.div>
 
 {/* Center Section - Logo */}
 <motion.div 
 layout
 transition={{ type: "spring", stiffness: 400, damping: 30 }}
 className="flex-shrink-0 flex items-center justify-center"
 >
 <Link href="/" className="flex items-center">
 <Image src="/images/logo-1.png" alt="Heaven Bricks Logo" width={280} height={80} className="h-14 lg:h-16 w-auto object-contain drop-shadow-sm" priority />
 </Link>
 </motion.div>
 
 {/* Right Section - User Actions & Mobile Menu */}
 <motion.div 
 layout
 transition={{ type: "spring", stiffness: 400, damping: 30 }}
 className={`${!isExpandedMenu ? "flex-1 min-w-max md:min-w-0" : "flex-shrink-0"} flex justify-end items-center gap-3 lg:gap-5`}
 >
 <div className="hidden md:flex items-center gap-3 lg:gap-5">
 <Link href="/search" className="text-zinc-600 hover:text-zinc-900 transition-colors" aria-label="Search Properties">
 <Search className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
 </Link>
 
 <AnimatePresence mode="popLayout">
 {user ? (
 <motion.div 
 key="user-actions"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.2 } }}
 className="flex items-center gap-2.5 lg:gap-4"
 >
 {(userData?.role === 'super_admin' || userData?.role === 'admin') && (
 <Link href="/admin" className="text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-1.5" aria-label="Admin Dashboard">
 <ShieldCheck className="w-4.5 h-4.5 lg:w-5 lg:h-5" />
 <span className="text-[12.5px] lg:text-[13.5px] font-bold hidden xl:inline">Admin</span>
 </Link>
 )}
 <Link href="/saved" className="text-zinc-900 hover:text-rose-500 transition-colors flex items-center gap-1.5" aria-label="Saved Properties">
 <span id="navbar-heart-icon" className="flex items-center justify-center">
 <Heart className={`w-4.5 h-4.5 lg:w-5 lg:h-5 transition-all duration-300 ${userData?.savedProperties?.length ? 'text-rose-500 fill-rose-500' : ''}`} />
 </span>
 <span className="text-[12.5px] lg:text-[13.5px] font-bold hidden xl:inline">Saved</span>
 </Link>
 <Link href="/dashboard" className="group text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-1.5" aria-label="Dashboard">
 {user?.photoURL ? (
 <img src={user.photoURL} alt="Profile" className="w-5 h-5 lg:w-6 lg:h-6 rounded-full object-cover border border-zinc-200 transition-transform duration-500 group-hover:scale-110" />
 ) : (
 <LayoutDashboard className="w-4.5 h-4.5 lg:w-5 lg:h-5 transition-transform duration-500 group-hover:rotate-180" />
 )}
 <span className="text-[12.5px] lg:text-[13.5px] font-bold hidden xl:inline">Dashboard</span>
 </Link>
 {/* Wallet Balance Indicator */}
 <Link href="/dashboard/wallet" className="relative group text-zinc-900 transition-all flex items-center gap-1.5 lg:gap-1.5 px-2 py-1 lg:px-2.5 rounded-lg border border-zinc-200 bg-white/60 shadow-sm hover:shadow-md hover:border-amber-300 hover:bg-amber-50/50" aria-label="Wallet">
 <div className="relative">
 <Wallet className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-600 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
 {wallet && wallet.credits > 0 && (
 <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
 )}
 </div>
 <span className="text-[11.5px] lg:text-[12.5px] font-extrabold text-zinc-900 group-hover:text-amber-700">${(wallet?.balance || 0).toFixed(2)}</span>
 </Link>

 <div className="flex items-center justify-center">
 <NotificationBell />
 </div>

 {/* Animated Sign Out Button */}
 <button onClick={handleSignOut} disabled={isSigningOut} className="text-zinc-600 hover:text-red-600 transition-colors flex items-center justify-center relative w-7 h-7 lg:w-[80px] lg:h-[26px]" aria-label="Sign Out">
 <AnimatePresence mode="wait">
 {isSigningOut ? (
 <motion.div
 key="signing-out"
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="absolute"
 >
 <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
 </motion.div>
 ) : (
 <motion.div
 key="sign-out-default"
 className="flex items-center gap-1.5 absolute w-full justify-center"
 >
 <motion.div
 exit={{ x: [0, -5, 70], opacity: [1, 1, 0], scale: [1, 1, 0.4] }}
 transition={{ duration: 0.4, times: [0, 0.2, 1], ease: "easeInOut" }}
 >
 <LogOut className="w-4 h-4" />
 </motion.div>
 <motion.span
 exit={{ y: -15, opacity: 0 }}
 transition={{ duration: 0.2, ease: "easeOut" }}
 className="text-[12.5px] lg:text-[13.5px] font-semibold whitespace-nowrap hidden lg:inline"
 >
 Sign Out
 </motion.span>
 </motion.div>
 )}
 </AnimatePresence>
 </button>
 </motion.div>
 ) : (
 <motion.div 
 key="guest-actions"
 initial={{ opacity: 0, x: 30 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.05 }}
 className="flex items-center gap-3 lg:gap-5"
 >
 <Link href="/login" className="text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-2" aria-label="Sign In">
 <UserCircle className="w-6 h-6" />
 <span className="text-[15px] font-bold">Sign In</span>
 </Link>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Post Listing Button */}
 {user && (userData?.role === 'seller' || userData?.role === 'admin' || userData?.role === 'super_admin') && (
 <Link href="/sell" className="bg-zinc-900 hover:bg-zinc-800 text-white px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-md text-[12px] lg:text-[13.5px] font-bold whitespace-nowrap transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md ml-1 lg:ml-2">
 Post Listing
 </Link>
 )}
 </div>

 <div className="flex md:hidden items-center">
 <button onClick={() => setIsMobileMenuOpen(true)} className="text-zinc-900 hover:text-zinc-600">
 <Menu className="w-6 h-6" />
 </button>
 </div>
 </motion.div>
 </div>
 </div>
 </header>

 {/* Ultra-Sleek Mobile Menu Overlay - MOVED OUTSIDE HEADER TO FIX Z-INDEX ISSUE WITH MAP */}
 <AnimatePresence>
 {isMobileMenuOpen && (
 <>
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-zinc-900/60 z-[9998] md:hidden backdrop-blur-sm"
 onClick={() => setIsMobileMenuOpen(false)}
 />
 <motion.div 
 initial={{ x: "100%" }}
 animate={{ x: 0 }}
 exit={{ x: "100%" }}
 transition={{ type: "spring", damping: 30, stiffness: 300 }}
 className="fixed top-0 right-0 h-[100dvh] w-[80vw] max-w-sm bg-white shadow-2xl z-[9999] md:hidden flex flex-col"
 >
 <div className="flex items-center justify-between p-5 pb-2 border-b border-zinc-100">
 <span className="font-extrabold text-xl text-zinc-900 tracking-tight">Menu</span>
 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100">
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto flex flex-col">
 {/* Profile Header for Logged-in Users */}
 {user && (
 <div className="px-5 py-5 bg-zinc-50 border-b border-zinc-100 flex flex-col gap-1">
 <h3 className="font-bold text-lg text-zinc-900 truncate">{userData?.name || 'Welcome'}</h3>
 <p className="text-zinc-500 text-xs font-medium truncate">{userData?.email || user.email}</p>
 {userData?.role && (
 <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 w-max rounded text-[10px] font-bold uppercase tracking-wider">
 {userData.role.replace('_', ' ')}
 </span>
 )}
 </div>
 )}

 <div className="flex flex-col py-3 px-3">
 {/* Main Links */}
 <div className="flex flex-col">
 <Link href="/search?type=buy" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-base font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 p-3 rounded-lg transition-all">
 <Home className="w-5 h-5 text-zinc-400" />
 Buy Properties
 </Link>
 <Link href="/search?type=rent" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-base font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 p-3 rounded-lg transition-all">
 <Search className="w-5 h-5 text-zinc-400" />
 Rent Properties
 </Link>
 </div>

 <hr className="border-zinc-100 my-3 mx-2" />

 {/* Account Links */}
 {user ? (
 <div className="flex flex-col">
 <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-base font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 p-3 rounded-lg transition-all">
 <UserCircle className="w-5 h-5 text-zinc-400" />
 Dashboard
 </Link>
 <Link href="/saved" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-base font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 p-3 rounded-lg transition-all">
 <span id="mobile-heart-icon" className="flex items-center justify-center">
 <Heart className={`w-5 h-5 transition-all duration-300 ${userData?.savedProperties?.length ? 'text-rose-500 fill-rose-500' : 'text-zinc-400 group-hover:text-rose-500'}`} />
 </span>
 Saved Properties
 </Link>
 
 {(userData?.role === 'seller' || userData?.role === 'admin' || userData?.role === 'super_admin') && (
 <Link href="/sell" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-base font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 p-3 rounded-lg transition-all">
 <Building className="w-5 h-5 text-zinc-400" />
 Post Listing
 </Link>
 )}

 {(userData?.role === 'super_admin' || userData?.role === 'admin') && (
 <Link 
 href="/admin" 
 className="flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-lg font-medium"
 onClick={() => setIsMobileMenuOpen(false)}
 >
 <ShieldCheck className="w-5 h-5" />
 Admin Control Panel
 </Link>
 )}
 </div>
 ) : (
 <div className="flex flex-col px-1 pt-1">
 <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 text-base font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 py-3 rounded-lg transition-all w-full mb-3">
 <UserCircle className="w-5 h-5" /> Sign In or Register
 </Link>
 </div>
 )}
 </div>
 </div>
 
 {/* Bottom Sign Out */}
 {user && (
 <div className="p-4 border-t border-zinc-100 bg-zinc-50 mt-auto">
 <button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full text-base font-bold text-rose-600 hover:text-rose-700 py-3 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all">
 <LogOut className="w-5 h-5" /> Sign Out
 </button>
 </div>
 )}
 </motion.div>
 </>
 )}
 </AnimatePresence>

 <AgentModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} />
 </>
 );
}
