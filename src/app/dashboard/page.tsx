"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, Heart, Building, MapPin, CheckCircle2, ShieldCheck, Search } from "@/components/Icons";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, documentId, doc, updateDoc } from 'firebase/firestore';
import { useFavorites } from "@/hooks/useFavorites";
import PropertyCard from "@/components/PropertyCard";

import { Tag, Clock, Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

export default function DashboardPage() {
 const { user, userData, loading } = useAuth();
 const router = useRouter();

 const { favorites, toggleFavorite, isFavorited, loading: favLoading } = useFavorites();
 const [savedProperties, setSavedProperties] = useState<any[]>([]);
 const [fetchingFavs, setFetchingFavs] = useState(false);

 const [myProperties, setMyProperties] = useState<any[]>([]);
 const [fetchingListings, setFetchingListings] = useState(false);

 const [myOffers, setMyOffers] = useState<any[]>([]);
 const [fetchingOffers, setFetchingOffers] = useState(false);

 useEffect(() => {
 if (!loading && !user) {
 router.push('/login');
 }
 }, [user, loading, router]);

 useEffect(() => {
 const fetchSavedProperties = async () => {
 if (favorites.length === 0) {
 setSavedProperties([]);
 return;
 }
 
 setFetchingFavs(true);
 try {
 const chunkedFavorites = [];
 for (let i = 0; i < favorites.length; i += 30) {
 chunkedFavorites.push(favorites.slice(i, i + 30));
 }
 
 let fetchedProps: any[] = [];
 for (const chunk of chunkedFavorites) {
 const q = query(collection(db, "properties"), where(documentId(), "in", chunk));
 const snap = await getDocs(q);
 snap.forEach(d => {
 fetchedProps.push({ id: d.id, ...d.data() });
 });
 }
 
 // Auto-cleanup: If some saved properties were deleted from the database
 if (fetchedProps.length < favorites.length && user) {
 try {
 const actualIds = fetchedProps.map(p => p.id);
 const userRef = doc(db, 'users', user.uid);
 await updateDoc(userRef, { savedProperties: actualIds });
 } catch (cleanupError) {
 console.error("Error cleaning up ghost favorites:", cleanupError);
 }
 }
 
 setSavedProperties(fetchedProps);
 } catch (error) {
 console.error("Error fetching favorites:", error);
 } finally {
 setFetchingFavs(false);
 }
 };

 fetchSavedProperties();
 }, [favorites, user]);

 useEffect(() => {
 const fetchMyListings = async () => {
 if (!user) return;
 
 setFetchingListings(true);
 try {
 const q = query(collection(db, "properties"), where("ownerId", "==", user.uid));
 const snap = await getDocs(q);
 const props: any[] = [];
 snap.forEach(doc => {
 props.push({ id: doc.id, ...doc.data() });
 });
 setMyProperties(props);
 } catch (error) {
 console.error("Error fetching listings:", error);
 } finally {
 setFetchingListings(false);
 }
 };

 fetchMyListings();
 }, [user]);

 useEffect(() => {
 const fetchMyOffers = async () => {
 if (!user) return;
 setFetchingOffers(true);
 try {
 const q = query(collection(db, "offers"), where("buyerId", "==", user.uid));
 const snap = await getDocs(q);
 const list: any[] = [];
 snap.forEach(d => {
 list.push({ id: d.id, ...d.data() });
 });
 list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
 setMyOffers(list);
 } catch (err) {
 console.error("Error fetching my offers:", err);
 } finally {
 setFetchingOffers(false);
 }
 };

 fetchMyOffers();
 }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans py-10 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden mb-10 border border-zinc-200 bg-white">
            <div className="h-48 bg-zinc-200"></div>
            <div className="px-8 pb-8 pt-0 flex gap-6 items-end">
              <div className="-mt-16 w-32 h-32 rounded-full border-4 border-white bg-zinc-300"></div>
              <div className="space-y-3 pb-2">
                <div className="h-8 w-48 bg-zinc-200 rounded-lg"></div>
                <div className="h-4 w-32 bg-zinc-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 h-64 bg-white rounded-2xl border border-zinc-200"></div>
            <div className="lg:col-span-3 space-y-6">
              <div className="h-10 w-48 bg-zinc-200 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-72 bg-white rounded-2xl border border-zinc-200"></div>
                <div className="h-72 bg-white rounded-2xl border border-zinc-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

 return (
 <div className="bg-zinc-50 font-sans min-h-screen py-10">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 
 {/* Profile Header */}
 <div className="relative rounded-3xl overflow-hidden mb-10 shadow-xl border border-zinc-200 bg-white">
 <div className="h-48 bg-zinc-900"></div>
 <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row items-center md:items-end gap-6 border-b border-zinc-100">
 <div className="-mt-16 relative">
 {userData?.photoURL || user?.photoURL ? (
 <img 
 src={userData?.photoURL || user?.photoURL || undefined} 
 alt="User Profile" 
 className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white shadow-md"
 />
 ) : (
 <div className="w-32 h-32 rounded-full border-4 border-white bg-zinc-100 flex items-center justify-center shadow-md">
 <UserCircle className="w-16 h-16 text-zinc-400" />
 </div>
 )}
 <div className="absolute bottom-2 right-2 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
 </div>
 <div className="flex-grow text-center md:text-left pt-4 md:pt-0 pb-2">
 <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center justify-center md:justify-start gap-2 tracking-tight">
 {user.displayName || "User"} <CheckCircle2 className="w-6 h-6 text-zinc-900" />
 </h1>
 <p className="text-zinc-500 font-medium">{user.email}</p>
 </div>
 <div className="flex gap-4 pb-2">
 <Link href="/settings" className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl font-bold transition-colors text-zinc-900 inline-flex items-center">
 Edit Profile
 </Link>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
 {/* Sidebar Nav */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-2xl p-4 shadow-lg border border-zinc-200 sticky top-24">
 <nav className="space-y-2 font-medium">
 <a href="#saved" className="flex items-center gap-3 px-4 py-3 bg-zinc-900 text-white rounded-xl transition-colors shadow-sm">
 <Heart className="w-5 h-5" /> Saved Properties
 </a>
 <a href="#offers" className="flex items-center justify-between px-4 py-3 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors">
 <div className="flex items-center gap-3">
 <Tag className="w-5 h-5" /> My Submitted Offers
 </div>
 {myOffers.length > 0 && (
 <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
 {myOffers.length}
 </span>
 )}
 </a>
 {(userData?.role === 'seller' || userData?.role === 'admin' || userData?.role === 'super_admin') && (
 <a href="#listings" className="flex items-center gap-3 px-4 py-3 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors">
 <Building className="w-5 h-5" /> My Listings
 </a>
 )}
 {(userData?.role === 'admin' || userData?.role === 'super_admin') && (
 <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-bold">
 <ShieldCheck className="w-5 h-5" /> Admin Control Panel
 </Link>
 )}
 <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors">
 <UserCircle className="w-5 h-5" /> Account Settings
 </Link>
 </nav>
 </div>
 </div>

 {/* Main Content */}
 <div className="lg:col-span-3 space-y-10">
 {/* Saved Properties */}
 <section id="saved">
 <h2 className="text-2xl font-bold mb-6 text-zinc-900 flex items-center gap-2">
 <Heart className="w-6 h-6 text-zinc-900" /> Saved Properties
 </h2>
 
 {fetchingFavs ? (
 <div className="text-zinc-500 font-medium">Loading your favorites...</div>
 ) : savedProperties.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {savedProperties.map(property => (
 <PropertyCard key={property.id} property={property as any} />
 ))}
 </div>
 ) : (
 <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200 shadow-sm">
 <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
 <Heart className="w-8 h-8 text-zinc-300" />
 </div>
 <h3 className="text-lg font-bold text-zinc-900 mb-2">No saved properties</h3>
 <p className="text-zinc-500 font-medium mb-6 text-sm max-w-sm mx-auto">Properties you save by clicking the heart icon will appear here.</p>
 <Link href="/search" className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-md text-sm">
 <Search className="w-4 h-4" /> Browse Properties
 </Link>
 </div>
 )}
 </section>

  {/* My Offers (Buyer sees ONLY their own price) */}
  <section id="offers" className="pt-8 border-t border-zinc-200">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
        <Tag className="w-6 h-6 text-zinc-900" /> My Submitted Offers
      </h2>
      <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
        Confidential To You
      </span>
    </div>

    {fetchingOffers ? (
      <div className="text-zinc-500 font-medium">Loading your offers...</div>
    ) : myOffers.length > 0 ? (
      <div className="grid grid-cols-1 gap-4">
        {myOffers.map((offer) => (
          <div key={offer.id} className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                <img 
                  src={offer.propertyDetails?.image || "/hero.png"} 
                  alt={offer.propertyDetails?.title || "Property"} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <Link href={`/property/${offer.propertyId}`} className="text-base font-bold text-zinc-900 hover:text-blue-600 transition-colors line-clamp-1">
                  {offer.propertyDetails?.title || "Property Offer"}
                </Link>
                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {offer.propertyDetails?.address || "New Zealand"}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                    offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    offer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {offer.status === 'accepted' ? 'Offer Accepted' : offer.status === 'rejected' ? 'Declined' : 'Pending Broker Review'}
                  </span>
                  {offer.createdAt && (
                    <span className="text-[11px] text-zinc-400">
                      Submitted {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Buyer's Own Price */}
            <div className="flex md:flex-col items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100">
              <div className="text-right">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Your Offered Price</span>
                <span className="text-2xl font-black text-emerald-600">
                  {formatCurrency(offer.offerPrice, "NZD")}
                </span>
              </div>
              <Link 
                href={`/property/${offer.propertyId}`}
                className="mt-2 text-xs font-bold text-zinc-900 hover:bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 transition-colors inline-block"
              >
                View Property
              </Link>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-white rounded-3xl p-10 text-center border border-zinc-200 shadow-sm">
        <Tag className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-zinc-900 mb-1">No offers submitted yet</h3>
        <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-4">
          When you submit an offer on any property, your confidential price and status will be tracked here.
        </p>
        <Link href="/search" className="inline-block bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors">
          Explore Properties
        </Link>
      </div>
    )}
  </section>

 {/* My Listings */}
 {(userData?.role === 'seller' || userData?.role === 'admin' || userData?.role === 'super_admin') && (
 <section id="listings" className="pt-8 border-t border-zinc-200">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
 <Building className="w-6 h-6 text-zinc-900" /> My Listings
 </h2>
 {myProperties.length > 0 && (
 <Link href="/sell" className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm">
 Post New Listing
 </Link>
 )}
 </div>
 
 {fetchingListings ? (
 <div className="text-zinc-500 font-medium">Loading your listings...</div>
 ) : myProperties.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {myProperties.map(property => (
 <div key={property.id} className="relative group">
 <PropertyCard property={property as any} />
 <div className="absolute top-4 left-4 z-10 flex gap-2 pointer-events-none">
 {property.status === 'approved' && <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">Live</span>}
 {property.status === 'pending' && <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">Pending Approval</span>}
 {property.status === 'rejected' && <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">Rejected</span>}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200 shadow-sm">
 <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-zinc-100">
 <Building className="w-10 h-10 text-zinc-300" />
 </div>
 <h3 className="text-xl font-bold text-zinc-900 mb-2">No listings yet</h3>
 <p className="text-zinc-500 font-medium mb-6 max-w-md mx-auto">You haven't posted any properties for sale or rent yet. Ready to reach thousands of buyers?</p>
 <Link href="/sell" className="inline-block bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg">
 Post a Listing
 </Link>
 </div>
 )}
 </section>
 )}

 {/* Admin State */}
 {(userData?.role === 'admin' || userData?.role === 'super_admin') && (
 <section id="admin" className="pt-8 border-t border-zinc-200">
 <h2 className="text-2xl font-bold mb-6 text-red-600 flex items-center gap-2">
 <ShieldCheck className="w-6 h-6 text-red-600" /> Super Admin Portal
 </h2>
 
 <div className="bg-gradient-to-br from-red-50 to-white rounded-3xl p-12 text-center border border-red-100 shadow-sm">
 <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-200">
 <ShieldCheck className="w-10 h-10 text-red-600" />
 </div>
 <h3 className="text-2xl font-bold text-zinc-900 mb-2">Enterprise Administration</h3>
 <p className="text-zinc-600 font-medium mb-8 max-w-lg mx-auto">
 You have unrestricted access to manage all property listings, approve or reject pending properties, and moderate user accounts across the platform.
 </p>
 <Link href="/admin" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-lg text-lg">
 Enter Admin Control Panel
 </Link>
 </div>
 </section>
 )}

 </div>
 </div>
 </div>
 </div>
 );
}
