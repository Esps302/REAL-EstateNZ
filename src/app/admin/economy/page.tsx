"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, limit, doc, setDoc, getDoc } from "firebase/firestore";
import { WalletTransaction, CreditTransaction, Wallet } from "@/types";
import { Loader2, TrendingUp, History, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { initializeWallet } from "@/lib/wallet";

export default function AdminEconomyPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  
  const [walletTxs, setWalletTxs] = useState<WalletTransaction[]>([]);
  const [fetching, setFetching] = useState(true);
  const [runningScript, setRunningScript] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (userData?.role !== "admin" && userData?.role !== "super_admin") {
        router.push("/");
      } else {
        fetchLogs();
      }
    }
  }, [loading, userData, router]);

  const fetchLogs = async () => {
    setFetching(true);
    try {
      const q = query(collection(db, "wallet_transactions"), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      setWalletTxs(snap.docs.map(d => d.data() as WalletTransaction));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load logs");
    } finally {
      setFetching(false);
    }
  };

  const handleRunLegacyScript = async () => {
    if (!confirm("This will find all users without a wallet and initialize it with 1000 credits. Proceed?")) return;
    
    setRunningScript(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      let updatedCount = 0;
      
      for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;
        const walletRef = doc(db, "wallets", userId);
        const wSnap = await getDoc(walletRef);
        
        if (!wSnap.exists()) {
          await initializeWallet(userId);
          updatedCount++;
        }
      }
      
      toast.success(`Successfully initialized wallets for ${updatedCount} legacy users.`);
    } catch (e) {
      console.error(e);
      toast.error("Script failed to run completely.");
    } finally {
      setRunningScript(false);
    }
  };

  if (loading || fetching) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-amber-500" /> Economy & Wallet Settings
          </h1>
          <p className="text-zinc-500 mt-1">Manage the platform's virtual economy, credits, and conversion rates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Legacy Script */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900 mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Legacy Users Setup
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            Run this one-time script to ensure all users who signed up before the Wallet Economy update receive their 1000 Welcome Credits.
          </p>
          <button 
            onClick={handleRunLegacyScript}
            disabled={runningScript}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-colors border border-blue-200 flex items-center justify-center gap-2"
          >
            {runningScript ? <Loader2 className="w-5 h-5 animate-spin" /> : <><RefreshCw className="w-4 h-4" /> Initialize Wallets for Old Users</>}
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <History className="w-32 h-32" />
          </div>
          <p className="text-zinc-400 font-medium mb-1 relative z-10">Total Transactions</p>
          <h2 className="text-4xl font-extrabold relative z-10">{walletTxs.length}</h2>
          <p className="text-sm text-zinc-500 relative z-10 mt-2">Displaying the most recent 50</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-zinc-900 mb-6">Recent Wallet Activity</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="p-4 font-bold text-zinc-700">Date</th>
              <th className="p-4 font-bold text-zinc-700">User ID</th>
              <th className="p-4 font-bold text-zinc-700">Type</th>
              <th className="p-4 font-bold text-zinc-700">Description</th>
              <th className="p-4 font-bold text-zinc-700 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {walletTxs.map((tx) => (
              <tr key={tx.id} className="hover:bg-zinc-50 transition-colors">
                <td className="p-4 text-zinc-500">{new Date(tx.createdAt).toLocaleString()}</td>
                <td className="p-4 font-medium text-zinc-900">{tx.userId.substring(0, 8)}...</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    tx.type === 'top_up' ? 'bg-blue-100 text-blue-700' :
                    tx.type === 'credit_conversion' ? 'bg-amber-100 text-amber-700' :
                    tx.type === 'listing_purchase' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {tx.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-zinc-600">{tx.description}</td>
                <td className={`p-4 text-right font-extrabold ${tx.amount > 0 ? 'text-green-600' : 'text-zinc-900'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount > 0 ? '$' : '-$'}{Math.abs(tx.amount).toFixed(2)}
                </td>
              </tr>
            ))}
            {walletTxs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
