"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

export function useFavorites() {
 const { user, userData } = useAuth();
 const router = useRouter();
 const [favorites, setFavorites] = useState<string[]>([]);
 const [loading, setLoading] = useState(false);

 // Keep local favorites in sync with userData
 useEffect(() => {
 if (userData && userData.savedProperties) {
 setFavorites(userData.savedProperties);
 } else {
 setFavorites([]);
 }
 }, [userData]);

 const toggleFavorite = async (propertyId: string) => {
 if (!user) {
 toast.error("Please sign in to save properties");
 router.push('/login');
 return;
 }

 setLoading(true);
 const isFavorited = favorites.includes(propertyId);
 
 // Optimistic UI update
 if (isFavorited) {
 setFavorites(prev => prev.filter(id => id !== propertyId));
 } else {
 setFavorites(prev => [...prev, propertyId]);
 }

 try {
 const userRef = doc(db, 'users', user.uid);
 await setDoc(userRef, {
 savedProperties: isFavorited ? arrayRemove(propertyId) : arrayUnion(propertyId)
 }, { merge: true });
 toast.success(isFavorited ? "Removed from saved properties" : "Saved to favorites!");
 } catch (error) {
 console.error("Failed to update favorites", error);
 toast.error("Failed to save property");
 // Revert optimistic update
 setFavorites(userData?.savedProperties || []);
 } finally {
 setLoading(false);
 }
 };

 const isFavorited = (propertyId: string) => {
 return favorites.includes(propertyId);
 };

 return { favorites, toggleFavorite, isFavorited, loading };
}
