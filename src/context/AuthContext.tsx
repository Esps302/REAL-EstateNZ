"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User as CustomUser, Wallet } from '@/types';
import { initializeWallet } from '@/lib/wallet';

interface AuthContextType {
 user: FirebaseUser | null;
 userData: CustomUser | null;
 wallet: Wallet | null;
 loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, wallet: null, loading: true });

export const useAuth = () => useContext(AuthContext);

 export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<CustomUser | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let unsubscribeSnapshot: (() => void) | null = null;
  let unsubscribeWallet: (() => void) | null = null;

  const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
  setUser(firebaseUser);
  if (firebaseUser) {
  try {
  // Initialize wallet if needed (this also ensures old users get their wallet)
  await initializeWallet(firebaseUser.uid);
  
  const docRef = doc(db, 'users', firebaseUser.uid);
  const walletRef = doc(db, 'wallets', firebaseUser.uid);
  
  unsubscribeWallet = onSnapshot(walletRef, (snap) => {
    if (snap.exists()) {
      setWallet(snap.data() as Wallet);
    }
  });
 
 unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
 if (docSnap.exists()) {
 const data = docSnap.data() as CustomUser;
 if (firebaseUser.email?.toLowerCase() === 'sanjay00002023@gmail.com') {
 data.role = 'super_admin';
 }
 setUserData(data);
 } else {
 if (firebaseUser.email?.toLowerCase() === 'sanjay00002023@gmail.com') {
 setUserData({
 id: firebaseUser.uid,
 name: firebaseUser.displayName || 'Sanjay Rana',
 email: firebaseUser.email,
 role: 'super_admin',
 createdAt: Date.now()
 });
 } else {
 setUserData(null);
 }
 }
 }, (error) => {
 console.error("Error listening to user data:", error);
 if (firebaseUser.email?.toLowerCase() === 'sanjay00002023@gmail.com') {
 setUserData({
 id: firebaseUser.uid,
 name: firebaseUser.displayName || 'Sanjay Rana',
 email: firebaseUser.email,
 role: 'super_admin',
 createdAt: Date.now()
 });
 } else {
 setUserData(null);
 }
 });
 } catch (error) {
 console.error("Error setting up user listener:", error);
 }
 } else {
 if (unsubscribeSnapshot) {
 unsubscribeSnapshot();
 unsubscribeSnapshot = null;
 }
 if (unsubscribeWallet) {
 unsubscribeWallet();
 unsubscribeWallet = null;
 }
 setUserData(null);
 setWallet(null);
 }
 setLoading(false);
 });

 return () => {
 unsubscribeAuth();
 if (unsubscribeSnapshot) {
 unsubscribeSnapshot();
 }
 if (unsubscribeWallet) {
 unsubscribeWallet();
 }
 };
 }, []);

 return (
 <AuthContext.Provider value={{ user, userData, wallet, loading }}>
 {!loading && children}
 </AuthContext.Provider>
 );
};
