"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, updatePassword, deleteUser, signOut, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { 
 User, Shield, Sliders, Bell, Activity, Eye, HelpCircle, AlertTriangle,
 Mail, Phone, MapPin, BadgeCheck, Key, Smartphone, Monitor, Lock,
 Heart, Map, DollarSign, Home, MessageSquare, List, CheckCircle,
 EyeOff, MessageCircle, FileText, Trash2, Power, LogOut, Upload, ChevronLeft
} from 'lucide-react';

type Tab = 'profile' | 'security' | 'preferences' | 'notifications' | 'activity' | 'privacy' | 'support' | 'management';

export default function SettingsPage() {
 const { user, userData, loading } = useAuth();
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<Tab>('profile');
 const [showCurrentPassword, setShowCurrentPassword] = useState(false);
 const [showNewPassword, setShowNewPassword] = useState(false);

 // Profile State
 const [name, setName] = useState('');
 const [phone, setPhone] = useState('');
 const [location, setLocation] = useState('');
 const [localPhotoURL, setLocalPhotoURL] = useState<string | null>(null);
 const [savingProfile, setSavingProfile] = useState(false);
 const [uploadingImage, setUploadingImage] = useState(false);
 const fileInputRef = React.useRef<HTMLInputElement>(null);

 // Security State
 const [currentPassword, setCurrentPassword] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [savingPassword, setSavingPassword] = useState(false);

 // Prefs & Notifications State
 const [savingPrefs, setSavingPrefs] = useState(false);
 const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
 const [minPrice, setMinPrice] = useState<string>('');
 const [maxPrice, setMaxPrice] = useState<string>('');
 const [prefLocations, setPrefLocations] = useState('');
 
 const [notifications, setNotifications] = useState({
 newPropertyAlerts: true,
 priceDropAlerts: true,
 directMessages: true,
 pushNotifications: false,
 marketingEmails: false
 });
 
 const [privacy, setPrivacy] = useState({
 publicProfile: false,
 hidePhone: true
 });

 // Support
 const [ticketSubject, setTicketSubject] = useState('');
 const [ticketMessage, setTicketMessage] = useState('');
 const [submittingTicket, setSubmittingTicket] = useState(false);

 useEffect(() => {
 if (!loading && !user) {
 router.push('/login');
 }
 }, [user, loading, router]);

 useEffect(() => {
 if (userData && user) {
 setName(user.displayName || '');
 setPhone(userData.phone || '');
 setLocation(userData.location || '');
 setLocalPhotoURL(userData.photoURL || user.photoURL || null);
 
 if (userData.preferences) {
 setPropertyTypes(userData.preferences.propertyTypes || []);
 setMinPrice(userData.preferences.minPrice?.toString() || '');
 setMaxPrice(userData.preferences.maxPrice?.toString() || '');
 setPrefLocations(userData.preferences.locations?.join(', ') || '');
 }
 
 if (userData.notifications) {
 setNotifications(userData.notifications);
 }
 
 if (userData.privacy) {
 setPrivacy(userData.privacy);
 }
 }
 }, [userData, user]);

 if (loading || !user) {
 return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold text-zinc-900">Loading...</div>;
 }

 const handleSaveProfile = async (e: React.FormEvent) => {
 e.preventDefault();
 setSavingProfile(true);
 try {
 await updateProfile(user, { displayName: name });
 await updateDoc(doc(db, 'users', user.uid), { name, phone, location });
 alert('Profile updated successfully!');
 } catch (err: any) {
 alert('Error updating profile: ' + err.message);
 }
 setSavingProfile(false);
 };

 const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file || !user) return;
 
 setUploadingImage(true);
 try {
 const imageRef = ref(storage, `profileImages/${user.uid}`);
 await uploadBytes(imageRef, file);
 const url = await getDownloadURL(imageRef);
 
 await updateProfile(user, { photoURL: url });
 await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
 setLocalPhotoURL(url);
 alert('Profile picture updated successfully!');
 } catch (err: any) {
 alert('Error uploading image: ' + err.message);
 } finally {
 setUploadingImage(false);
 if (fileInputRef.current) {
 fileInputRef.current.value = '';
 }
 }
 };

 const handleUpdatePassword = async () => {
 if (!newPassword) return;
 const hasPassword = user.providerData.some(p => p.providerId === 'password');
 
 if (!hasPassword && newPassword !== confirmPassword) {
 alert("Passwords do not match!");
 return;
 }
 
 setSavingPassword(true);
 try {
 if (hasPassword && currentPassword) {
 if (!user.email) throw new Error("Email not found");
 const credential = EmailAuthProvider.credential(user.email, currentPassword);
 await reauthenticateWithCredential(user, credential);
 }
 
 await updatePassword(user, newPassword);
 setNewPassword('');
 setCurrentPassword('');
 setConfirmPassword('');
 alert(hasPassword ? 'Password updated successfully!' : 'Password created successfully! You can now log in with your email and password.');
 } catch (err: any) {
 if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
 alert('Incorrect current password.');
 } else if (err.code === 'auth/requires-recent-login') {
 alert('For security reasons, you must log out and log back in before changing your password. (Try entering your current password if you haven\'t)');
 } else {
 alert('Error updating password: ' + err.message);
 }
 }
 setSavingPassword(false);
 };

 const handleLogoutAll = async () => {
 if (confirm('Are you sure you want to sign out?')) {
 await signOut(auth);
 router.push('/login');
 }
 };

 const handleSavePreferences = async () => {
 setSavingPrefs(true);
 try {
 await updateDoc(doc(db, 'users', user.uid), {
 preferences: {
 propertyTypes,
 minPrice: minPrice ? Number(minPrice) : null,
 maxPrice: maxPrice ? Number(maxPrice) : null,
 locations: prefLocations.split(',').map(l => l.trim()).filter(l => l)
 },
 notifications,
 privacy
 });
 alert('Preferences saved successfully!');
 } catch (err: any) {
 alert('Error saving preferences: ' + err.message);
 }
 setSavingPrefs(false);
 };

 const togglePropertyType = (type: string) => {
 setPropertyTypes(prev => 
 prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
 );
 };

 const handleSubmitTicket = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!ticketSubject || !ticketMessage) return;
 setSubmittingTicket(true);
 try {
 await addDoc(collection(db, 'support_tickets'), {
 userId: user.uid,
 email: user.email,
 subject: ticketSubject,
 message: ticketMessage,
 createdAt: Date.now(),
 status: 'open'
 });
 setTicketSubject('');
 setTicketMessage('');
 alert('Support ticket submitted successfully!');
 } catch (err: any) {
 alert('Error submitting ticket: ' + err.message);
 }
 setSubmittingTicket(false);
 };

 const handleDeleteAccount = async () => {
 const confirmDelete = confirm('WARNING: This will permanently delete your account and all data. Are you absolutely sure?');
 if (!confirmDelete) return;
 
 try {
  try {
    // Delete properties where user is seller
    const propsQuery = query(collection(db, 'properties'), where('sellerId', '==', user.uid));
    const propsSnap = await getDocs(propsQuery);
    for (const d of propsSnap.docs) await deleteDoc(d.ref);

    // Delete wallet
    await deleteDoc(doc(db, 'wallets', user.uid));

    // Delete wallet transactions
    const wTxsQuery = query(collection(db, 'wallet_transactions'), where('userId', '==', user.uid));
    const wTxsSnap = await getDocs(wTxsQuery);
    for (const d of wTxsSnap.docs) await deleteDoc(d.ref);

    // Delete credit transactions
    const cTxsQuery = query(collection(db, 'credit_transactions'), where('userId', '==', user.uid));
    const cTxsSnap = await getDocs(cTxsQuery);
    for (const d of cTxsSnap.docs) await deleteDoc(d.ref);

    // Try to delete the user document
    await deleteDoc(doc(db, 'users', user.uid));
  } catch (dbErr) {
    console.warn("Could not delete some user data due to permissions, but proceeding to delete auth account.", dbErr);
  }
 
 // Delete the actual authentication account
 await deleteUser(user);
 router.push('/');
 } catch (err: any) {
 if (err.code === 'auth/requires-recent-login') {
 alert('For security reasons, you must log out and log back in before deleting your account.');
 } else {
 alert('Error deleting account: ' + err.message);
 }
 }
 };

 const tabs: { id: Tab, label: string, icon: React.ReactNode }[] = [
 { id: 'profile', label: 'Profile Information', icon: <User className="w-5 h-5" /> },
 { id: 'security', label: 'Account Security', icon: <Shield className="w-5 h-5" /> },
 { id: 'preferences', label: 'Saved & Preferences', icon: <Sliders className="w-5 h-5" /> },
 { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
 { id: 'activity', label: 'My Activity', icon: <Activity className="w-5 h-5" /> },
 { id: 'privacy', label: 'Privacy Settings', icon: <Eye className="w-5 h-5" /> },
 { id: 'support', label: 'Help & Support', icon: <HelpCircle className="w-5 h-5" /> },
 { id: 'management', label: 'Account Management', icon: <AlertTriangle className="w-5 h-5" /> },
 ];

 return (
 <div className="bg-zinc-50 font-sans min-h-screen py-10">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
 <div>
 <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Account Settings</h1>
 <p className="text-zinc-500 font-medium mt-1">Manage your account details and preferences.</p>
 </div>
 <button 
 onClick={() => router.back()} 
 className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-900 rounded-xl font-bold transition-all shadow-sm"
 aria-label="Go back"
 >
 <ChevronLeft className="w-5 h-5" /> Back
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
 {/* Sidebar */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden sticky top-24">
 <nav className="flex flex-col p-2">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
 activeTab === tab.id 
 ? 'bg-zinc-900 text-white shadow-md' 
 : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
 }`}
 >
 {tab.icon}
 {tab.label}
 </button>
 ))}
 </nav>
 </div>
 </div>

 {/* Main Content Area */}
 <div className="lg:col-span-3">
 <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 min-h-[600px]">
 
 {/* 1. Profile Information */}
 {activeTab === 'profile' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Profile Information</h2>
 
 <div className="flex items-center gap-6 mb-8">
 <input 
 type="file" 
 accept="image/*" 
 ref={fileInputRef} 
 className="hidden" 
 onChange={handleImageUpload} 
 />
 <div 
 className="relative group cursor-pointer"
 onClick={() => !uploadingImage && fileInputRef.current?.click()}
 >
 <div className={`w-24 h-24 rounded-full bg-zinc-200 overflow-hidden border-4 border-white shadow-md ${uploadingImage ? 'opacity-50' : ''}`}>
 {localPhotoURL ? (
 <img src={localPhotoURL} alt="Profile" className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
 <User className="w-10 h-10" />
 </div>
 )}
 </div>
 {!uploadingImage && (
 <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
 <Upload className="w-6 h-6 text-white" />
 </div>
 )}
 {uploadingImage && (
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 </div>
 )}
 </div>
 <div>
 <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
 {user.displayName || 'Unknown User'} 
 <BadgeCheck className="w-5 h-5 text-emerald-500" />
 </h3>
 <p className="text-sm font-medium text-zinc-500 capitalize">{userData?.role || 'buyer'} Account</p>
 </div>
 </div>

 <form className="space-y-5 max-w-2xl" onSubmit={handleSaveProfile}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block text-sm font-semibold text-zinc-700 mb-2">Full Name</label>
 <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 outline-none transition-all text-zinc-900" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-zinc-700 mb-2">Email Address</label>
 <input type="email" value={user.email || ''} readOnly className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-500 cursor-not-allowed outline-none" />
 <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Verified</p>
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block text-sm font-semibold text-zinc-700 mb-2">Phone Number</label>
 <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+64 21 000 0000" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 outline-none transition-all text-zinc-900" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-zinc-700 mb-2">Location (City, Country)</label>
 <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Auckland, New Zealand" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 outline-none transition-all text-zinc-900" />
 </div>
 </div>

 <div className="pt-4">
 <button type="submit" disabled={savingProfile} className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-70 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm">
 {savingProfile ? 'Saving...' : 'Save Changes'}
 </button>
 </div>
 </form>
 </div>
 )}

 {/* 2. Account Security */}
 {activeTab === 'security' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
 <h2 className="text-2xl font-bold text-zinc-900 border-b border-zinc-100 pb-4">Account Security</h2>
 
 <div className="space-y-4 max-w-2xl">
 <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
 <Key className="w-5 h-5" /> {user.providerData.some(p => p.providerId === 'password') ? 'Change Password' : 'Create Password for Email Login'}
 </h3>
 
 {!user.providerData.some(p => p.providerId === 'password') && (
 <p className="text-sm text-zinc-600 mb-4">
 You signed in with Google. Set a password here so you can also log in directly with your email and password.
 </p>
 )}

 {user.providerData.some(p => p.providerId === 'password') && (
 <div className="relative">
 <input 
 type={showCurrentPassword ? "text" : "password"} 
 placeholder="Current Password" 
 value={currentPassword}
 onChange={(e) => setCurrentPassword(e.target.value)}
 className="w-full pl-4 pr-12 py-3 rounded-xl border border-zinc-200 bg-zinc-50 outline-none focus:ring-2 focus:ring-zinc-900" 
 />
 <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors">
 {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
 </button>
 </div>
 )}
 
 <div className="relative">
 <input 
 type={showNewPassword ? "text" : "password"} 
 value={newPassword} 
 onChange={(e) => setNewPassword(e.target.value)} 
 placeholder={user.providerData.some(p => p.providerId === 'password') ? "New Password" : "Set Password"} 
 className="w-full pl-4 pr-12 py-3 rounded-xl border border-zinc-200 bg-zinc-50 outline-none focus:ring-2 focus:ring-zinc-900" 
 />
 <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors">
 {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
 </button>
 </div>

 {!user.providerData.some(p => p.providerId === 'password') && (
 <div className="relative">
 <input 
 type="password" 
 value={confirmPassword} 
 onChange={(e) => setConfirmPassword(e.target.value)} 
 placeholder="Confirm Password" 
 className="w-full pl-4 pr-12 py-3 rounded-xl border border-zinc-200 bg-zinc-50 outline-none focus:ring-2 focus:ring-zinc-900" 
 />
 </div>
 )}

 <button onClick={handleUpdatePassword} disabled={savingPassword || !newPassword} className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-70 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
 {savingPassword ? 'Processing...' : (user.providerData.some(p => p.providerId === 'password') ? 'Update Password' : 'Create Password')}
 </button>
 </div>

 <hr className="border-zinc-100" />

 <div className="max-w-2xl">
 <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-4"><Monitor className="w-5 h-5" /> Login Activity</h3>
 <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex justify-between items-center">
 <div>
 <p className="font-bold text-zinc-900">Current Session</p>
 <p className="text-xs text-emerald-600 font-medium">Active now</p>
 </div>
 <Monitor className="w-6 h-6 text-zinc-400" />
 </div>
 <button onClick={handleLogoutAll} className="mt-4 text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
 <LogOut className="w-4 h-4" /> Logout from all devices
 </button>
 </div>
 </div>
 )}

 {/* 3. Saved & Preferences */}
 {activeTab === 'preferences' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 max-w-2xl">
 <h2 className="text-2xl font-bold text-zinc-900 border-b border-zinc-100 pb-4">Saved & Preferences</h2>
 
 <div>
 <h3 className="text-lg font-bold text-zinc-900 mb-3">Preferred Property Types</h3>
 <div className="flex flex-wrap gap-3">
 {['House', 'Apartment', 'Villa', 'Townhouse', 'Land'].map(type => (
 <label key={type} className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl cursor-pointer hover:border-zinc-300">
 <input type="checkbox" checked={propertyTypes.includes(type)} onChange={() => togglePropertyType(type)} className="w-4 h-4 text-zinc-900 rounded focus:ring-zinc-900" />
 <span className="text-sm font-semibold text-zinc-700">{type}</span>
 </label>
 ))}
 </div>
 </div>

 <div>
 <h3 className="text-lg font-bold text-zinc-900 mb-3">Budget Range</h3>
 <div className="flex items-center gap-4">
 <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min Price" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 outline-none focus:ring-2 focus:ring-zinc-900" />
 <span className="text-zinc-400 font-bold">to</span>
 <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max Price" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 outline-none focus:ring-2 focus:ring-zinc-900" />
 </div>
 </div>

 <div>
 <h3 className="text-lg font-bold text-zinc-900 mb-3">Preferred Locations</h3>
 <input type="text" value={prefLocations} onChange={(e) => setPrefLocations(e.target.value)} placeholder="e.g. Herne Bay, Ponsonby, Remuera" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 outline-none focus:ring-2 focus:ring-zinc-900" />
 <p className="text-xs text-zinc-500 mt-2">Separate locations with commas. We use this to improve your recommendations.</p>
 </div>

 <button onClick={handleSavePreferences} disabled={savingPrefs} className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-70 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm mt-4">
 {savingPrefs ? 'Saving...' : 'Save Preferences'}
 </button>
 </div>
 )}

 {/* 4. Notifications Settings */}
 {activeTab === 'notifications' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-2xl">
 <h2 className="text-2xl font-bold text-zinc-900 border-b border-zinc-100 pb-4">Notifications Settings</h2>
 
 {[
 { id: 'newPropertyAlerts', title: "New property alerts", desc: "Get notified when properties matching your preferences are listed." },
 { id: 'priceDropAlerts', title: "Price drop alerts", desc: "Be the first to know if a saved property drops in price." },
 { id: 'directMessages', title: "Messages from agents/sellers", desc: "Receive emails when you get a direct message." },
 { id: 'pushNotifications', title: "Push Notifications", desc: "Enable mobile push notifications for instant alerts." },
 { id: 'marketingEmails', title: "Marketing emails", desc: "Receive newsletters, market updates, and exclusive offers." },
 ].map((notif) => (
 <div key={notif.id} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
 <div className="pr-4">
 <p className="font-bold text-zinc-900">{notif.title}</p>
 <p className="text-sm text-zinc-500">{notif.desc}</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
 <input type="checkbox" className="sr-only peer" checked={(notifications as any)[notif.id]} onChange={(e) => setNotifications({...notifications, [notif.id]: e.target.checked})} />
 <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
 </label>
 </div>
 ))}

 <button onClick={handleSavePreferences} disabled={savingPrefs} className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-70 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm mt-4">
 {savingPrefs ? 'Saving...' : 'Save Settings'}
 </button>
 </div>
 )}

 {/* 5. My Activity */}
 {activeTab === 'activity' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-b border-zinc-100 pb-4">My Activity</h2>
 
 <div className="space-y-4">
 <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-start gap-4">
 <div className="bg-zinc-900 text-white p-2 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
 <div>
 <p className="font-bold text-zinc-900">Account successfully created</p>
 <p className="text-sm text-zinc-500">Activity logged</p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* 6. Privacy Settings */}
 {activeTab === 'privacy' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-2xl">
 <h2 className="text-2xl font-bold text-zinc-900 border-b border-zinc-100 pb-4">Privacy Settings</h2>
 
 <div className="flex items-center justify-between py-3">
 <div className="pr-4">
 <p className="font-bold text-zinc-900">Public Profile Visibility</p>
 <p className="text-sm text-zinc-500">Allow other users and agents to see your profile details.</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input type="checkbox" className="sr-only peer" checked={privacy.publicProfile} onChange={(e) => setPrivacy({...privacy, publicProfile: e.target.checked})} />
 <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
 </label>
 </div>
 
 <div className="flex items-center justify-between py-3">
 <div className="pr-4">
 <p className="font-bold text-zinc-900">Hide Phone Number</p>
 <p className="text-sm text-zinc-500">Your phone number will only be shared when you explicitly contact an agent.</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input type="checkbox" className="sr-only peer" checked={privacy.hidePhone} onChange={(e) => setPrivacy({...privacy, hidePhone: e.target.checked})} />
 <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
 </label>
 </div>

 <button onClick={handleSavePreferences} disabled={savingPrefs} className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-70 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm mt-4">
 {savingPrefs ? 'Saving...' : 'Save Privacy Settings'}
 </button>
 </div>
 )}

 {/* 7. Help & Support */}
 {activeTab === 'support' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
 <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Help & Support</h2>
 
 <form onSubmit={handleSubmitTicket} className="space-y-4 border border-zinc-200 rounded-2xl p-6 bg-zinc-50">
 <h3 className="font-bold text-zinc-900">Report an Issue</h3>
 <div>
 <input type="text" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} placeholder="Subject" className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white outline-none focus:ring-2 focus:ring-zinc-900" />
 </div>
 <div>
 <textarea value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={4} className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white outline-none focus:ring-2 focus:ring-zinc-900 resize-none"></textarea>
 </div>
 <button type="submit" disabled={submittingTicket} className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-70 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
 {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
 </button>
 </form>
 </div>
 )}

 {/* 8. Account Management */}
 {activeTab === 'management' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
 <h2 className="text-2xl font-bold text-zinc-900 border-b border-zinc-100 pb-4 text-red-600">Danger Zone</h2>
 
 <div className="border border-red-200 bg-red-50 rounded-2xl p-6 mt-6 space-y-6">
 <div>
 <h3 className="text-lg font-bold text-red-900 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Delete Account</h3>
 <p className="text-sm text-red-700 mt-1 mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
 <button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm">Delete Account</button>
 </div>
 </div>
 </div>
 )}

 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
