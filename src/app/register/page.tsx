"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, addDoc, collection } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserRole } from '@/types';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Google } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';

// Detect if running inside Capacitor (Android/iOS native app)
const isNative = () =>
  typeof window !== 'undefined' &&
  !!(window as any).Capacitor?.isNativePlatform?.();

export default function RegisterPage() {
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [role, setRole] = useState<UserRole>('buyer');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const router = useRouter();
 const { user } = useAuth();


 useEffect(() => {
 if (user) {
 router.push('/dashboard');
 }
 }, [user, router]);

 const handleRegister = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');
 try {
 const userCredential = await createUserWithEmailAndPassword(auth, email, password);
 // Update display name
 await updateProfile(userCredential.user, {
 displayName: name
 });
 
 let finalRole = role;
 if (email.toLowerCase() === 'sanjayranatanabana@gmail.com' || email.toLowerCase() === 'sanjayrana00002023@gmail.com') {
 finalRole = 'super_admin';
 }

 // Save user to Firestore
 await setDoc(doc(db, "users", userCredential.user.uid), {
 id: userCredential.user.uid,
 name,
 email,
 role: finalRole,
 createdAt: Date.now()
 });

  // Notify admin
  await addDoc(collection(db, "notifications"), {
    userId: "admin_system",
    title: "New User Registered",
    message: `${name} has joined the platform as a ${finalRole}.`,
    type: "info",
    isRead: false,
    isPoppedUp: false,
    link: "/admin/users",
    createdAt: Date.now()
  }).catch(err => console.error("Failed to notify admin", err));

  // Navigate immediately
  router.push('/dashboard');

  // Send Welcome Email in background
  fetch('/api/email', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_SECRET || 'dev-secret-key'}`
    },
    body: JSON.stringify({
      to: email,
      templateType: 'welcomeConfirmation',
      payload: { userName: name, role: finalRole }
    })
  }).catch(err => console.error("Failed to send welcome email", err));

} catch (err: any) {
 setError(err.message || 'Failed to register');
 setLoading(false);
 }
 };

 const handleGoogleSignIn = async () => {
  setLoading(true);
  setError('');
  try {
    let firebaseUser;

    if (isNative()) {
      // On Android/iOS: use native Google Sign-In plugin
      const { GoogleSignIn } = await import('@capawesome/capacitor-google-sign-in');
      await GoogleSignIn.initialize({ clientId: '943671421296-6r7jidf10c3ce6jdendu04ponjiafcce.apps.googleusercontent.com' });
      const result = await GoogleSignIn.signIn();
      const idToken = result.idToken;
      if (!idToken) throw new Error('No ID token received from Google');
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      firebaseUser = userCredential.user;
    } else {
      // On web: use Firebase popup
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      firebaseUser = userCredential.user;
    }

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      const userEmail = firebaseUser.email || '';
      let finalRole = 'buyer';
      if (userEmail.toLowerCase() === 'sanjayranatanabana@gmail.com' || userEmail.toLowerCase() === 'sanjayrana00002023@gmail.com') {
        finalRole = 'super_admin';
      }
      await setDoc(userDocRef, {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Unknown User',
        email: userEmail,
        role: finalRole,
        createdAt: Date.now()
      });
      await addDoc(collection(db, 'notifications'), {
        userId: 'admin_system',
        title: 'New User Registered',
        message: `${firebaseUser.displayName || 'Unknown User'} has joined the platform as a ${finalRole}.`,
        type: 'info',
        isRead: false,
        isPoppedUp: false,
        link: '/admin/users',
        createdAt: Date.now()
      }).catch(() => {});
    }
    router.push('/dashboard');
  } catch (err: any) {
    setError(err.message || 'Failed to sign in with Google');
    setLoading(false);
  }
 };

 return (
 <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 <h2 className="mt-6 text-center text-4xl font-extrabold text-zinc-900 tracking-tight">
 Create an account
 </h2>
 <p className="mt-2 text-center text-sm text-zinc-500">
 Already have an account?{' '}
 <Link href="/login" className="font-semibold text-zinc-900 underline underline-offset-4 hover:text-zinc-700 transition-colors">
 Sign in here
 </Link>
 </p>
 </div>

 <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
 <div className="bg-white py-10 px-6 sm:rounded-2xl sm:px-12 border border-zinc-200" style={{ boxShadow: '0 4px 24px -6px rgba(0, 0, 0, 0.05)' }}>
 <form className="space-y-6" onSubmit={handleRegister}>
 {error && (
 <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-100 flex items-start">
 <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
 {error}
 </div>
 )}

 <div>
 <label className="block text-sm font-semibold text-zinc-900 mb-3">
 Account Type
 </label>
 <div className="grid grid-cols-2 gap-4">
 <button
 type="button"
 onClick={() => setRole('buyer')}
 className={`py-3 px-4 rounded-lg border text-sm font-semibold transition-all ${
 role === 'buyer'
 ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
 : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
 }`}
 >
 Buyer
 </button>
 <button
 type="button"
 onClick={() => setRole('seller')}
 className={`py-3 px-4 rounded-lg border text-sm font-semibold transition-all ${
 role === 'seller'
 ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
 : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
 }`}
 >
 Seller
 </button>
 </div>
 </div>

 <div>
 <label className="block text-sm font-semibold text-zinc-900 mb-2">
 Full Name
 </label>
 <div className="relative rounded-lg shadow-sm">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <User className="h-5 w-5 text-zinc-400" />
 </div>
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="block w-full pl-11 pr-4 py-3 text-base text-zinc-900 bg-white border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
 placeholder="e.g. Your Name"
 />
 </div>
 </div>
 
 <div>
 <label className="block text-sm font-semibold text-zinc-900 mb-2">
 Email address
 </label>
 <div className="relative rounded-lg shadow-sm">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Mail className="h-5 w-5 text-zinc-400" />
 </div>
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="block w-full pl-11 pr-4 py-3 text-base text-zinc-900 bg-white border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
 placeholder="e.g. email@example.com"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-semibold text-zinc-900 mb-2">
 Password
 </label>
 <div className="relative rounded-lg shadow-sm">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Lock className="h-5 w-5 text-zinc-400" />
 </div>
 <input
 type={showPassword ? "text" : "password"}
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="block w-full pl-11 pr-12 py-3 text-base text-zinc-900 bg-white border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
 placeholder="Create a strong password"
 minLength={6}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
 >
 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
 </button>
 </div>
 </div>

 <div className="pt-2">
 <button
 type="submit"
 disabled={loading}
 className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
 >
 {loading ? 'Creating account...' : 'Create Account'}
 </button>
 </div>
 </form>

 <div className="mt-6">
 <div className="relative">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t border-zinc-200" />
 </div>
 <div className="relative flex justify-center text-sm">
 <span className="px-2 bg-white text-zinc-500 font-medium">Or continue with</span>
 </div>
 </div>

 <div className="mt-6">
 <button
 type="button"
 onClick={handleGoogleSignIn}
 disabled={loading}
 className="w-full inline-flex justify-center items-center py-3 px-4 border border-zinc-200 rounded-lg shadow-sm bg-white text-sm font-bold text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
 >
 <Google className="w-5 h-5 mr-2" />
 Sign in with Google
 </button>
 </div>
 </div>

 </div>
 </div>
 </div>
 );
}
