"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { convertCreditsToBalance, simulateTopUpWallet } from "@/lib/wallet";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WalletTransaction, CreditTransaction } from "@/types";
import { Wallet, ShieldCheck, ArrowRightLeft, Plus, History, Loader2, Star, UserPlus, Handshake, Calendar, X, CheckCircle2, Coins, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

const goldCoinAudio = typeof window !== "undefined" ? new Audio("/sounds/mixkit-gold-coin-prize-1999.wav") : null;
if (goldCoinAudio) {
  goldCoinAudio.preload = "auto";
}

export default function WalletPage() {
  const { user, wallet, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"convert" | "topup" | "history">("convert");
  
  const [isConverting, setIsConverting] = useState(false);
  const [convertAmount, setConvertAmount] = useState<number>(1000);
  
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(10);
  
  const [walletTxs, setWalletTxs] = useState<WalletTransaction[]>([]);
  const [creditTxs, setCreditTxs] = useState<CreditTransaction[]>([]);
  const [fetchingTxs, setFetchingTxs] = useState(false);
  const [successModal, setSuccessModal] = useState<{type: 'convert'|'topup', amount: number} | null>(null);

  const playGoldSound = () => {
    try {
      if (goldCoinAudio) {
        goldCoinAudio.currentTime = 0;
        goldCoinAudio.volume = 0.6;
        const playPromise = goldCoinAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.error("Audio blocked", e));
        }
      }
    } catch(e) {}
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (activeTab === "history" && user) {
      fetchHistory();
    }
  }, [activeTab, user]);

  const fetchHistory = async () => {
    if (!user) return;
    setFetchingTxs(true);
    try {
      const qW = query(collection(db, "wallet_transactions"), where("userId", "==", user.uid));
      const snapW = await getDocs(qW);
      const wTxs = snapW.docs.map(d => d.data() as WalletTransaction);
      wTxs.sort((a, b) => b.createdAt - a.createdAt);
      setWalletTxs(wTxs);
      
      const qC = query(collection(db, "credit_transactions"), where("userId", "==", user.uid));
      const snapC = await getDocs(qC);
      const cTxs = snapC.docs.map(d => d.data() as CreditTransaction);
      cTxs.sort((a, b) => b.createdAt - a.createdAt);
      setCreditTxs(cTxs);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load history");
    } finally {
      setFetchingTxs(false);
    }
  };

  const handleConvert = async () => {
    if (!user || !wallet) return;
    if (wallet.credits < convertAmount) {
      toast.error("Insufficient credits");
      return;
    }
    setIsConverting(true);
    const success = await convertCreditsToBalance(user.uid, convertAmount, 1000);
    setIsConverting(false);
    if (success) {
      setSuccessModal({ type: 'convert', amount: convertAmount });
      playGoldSound();
      setConvertAmount(1000);
      setTimeout(() => setSuccessModal(null), 5000);
    } else {
      toast.error("Conversion failed");
    }
  };

  const handleTopUp = async () => {
    if (!user) return;
    if (topUpAmount <= 0) return;
    setIsToppingUp(true);
    const success = await simulateTopUpWallet(user.uid, topUpAmount);
    setIsToppingUp(false);
    if (success) {
      setSuccessModal({ type: 'topup', amount: topUpAmount });
      playGoldSound();
      setTopUpAmount(10);
      setTimeout(() => setSuccessModal(null), 5000);
    } else {
      toast.error("Top up failed");
    }
  };

  if (loading || !user || !wallet) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold text-zinc-900"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Wallet...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      <AnimatePresence>
        {successModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              onClick={() => setSuccessModal(null)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-zinc-100 text-center"
            >
              <button 
                onClick={() => setSuccessModal(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-amber-50">
                <CheckCircle2 className="w-10 h-10 text-amber-500" />
              </div>
              
              <h2 className="text-2xl font-extrabold text-zinc-900 mb-2">Success!</h2>
              
              {successModal.type === 'convert' ? (
                <p className="text-zinc-600 font-medium mb-6">
                  You successfully converted <span className="font-bold text-amber-600">{successModal.amount} Credits</span> into <span className="font-bold text-green-600">${(successModal.amount / 1000).toFixed(2)}</span> balance.
                </p>
              ) : (
                <p className="text-zinc-600 font-medium mb-6">
                  You successfully topped up your wallet with <span className="font-bold text-green-600">${successModal.amount.toFixed(2)}</span>.
                </p>
              )}
              
              <button 
                onClick={() => setSuccessModal(null)}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all active:scale-95"
              >
                Awesome!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-8">My Wallet</h1>
        
        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="w-32 h-32" />
            </div>
            <p className="text-zinc-400 font-medium mb-1 relative z-10">Wallet Balance</p>
            <h2 className="text-5xl font-extrabold relative z-10">${wallet.balance.toFixed(2)}</h2>
          </div>
          
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-500">
              <Coins className="w-32 h-32" />
            </div>
            <p className="text-zinc-500 font-medium mb-1 relative z-10">Available Credits</p>
            <h2 className="text-5xl font-extrabold text-amber-500 relative z-10">{wallet.credits} <span className="text-xl text-zinc-400 font-medium">Credits</span></h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mb-6">
          <button 
            onClick={() => setActiveTab("convert")}
            className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === "convert" ? "bg-amber-50 text-amber-700 border-b-2 border-amber-500" : "text-zinc-600 hover:bg-zinc-50"}`}
          >
            <ArrowRightLeft className="w-4 h-4" /> Convert Credits
          </button>
          <button 
            onClick={() => setActiveTab("topup")}
            className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === "topup" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500" : "text-zinc-600 hover:bg-zinc-50"}`}
          >
            <Plus className="w-4 h-4" /> Top Up
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === "history" ? "bg-zinc-100 text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-600 hover:bg-zinc-50"}`}
          >
            <History className="w-4 h-4" /> History
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8">
          
          {/* CONVERT TAB */}
          {activeTab === "convert" && (
            <div className="max-w-md mx-auto py-4 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRightLeft className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">Convert Credits</h3>
              <p className="text-zinc-500 mb-8">1000 Credits = $1.00 Wallet Balance</p>
              
              <div className="mb-6 text-left">
                <label className="block text-sm font-bold text-zinc-700 mb-2">Amount to convert</label>
                <input 
                  type="number" 
                  step="100"
                  min="100"
                  max={wallet.credits}
                  value={convertAmount} 
                  onChange={(e) => setConvertAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 font-bold"
                />
              </div>

              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-6 flex justify-between items-center">
                <span className="text-zinc-600 font-medium">You will receive:</span>
                <span className="text-2xl font-extrabold text-green-600">${(convertAmount / 1000).toFixed(2)}</span>
              </div>

              <button 
                onClick={handleConvert}
                disabled={isConverting || convertAmount <= 0 || convertAmount > wallet.credits}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Conversion"}
              </button>
            </div>
          )}

          {/* TOP UP TAB */}
          {activeTab === "topup" && (
            <div className="max-w-md mx-auto py-4 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">Top Up Wallet</h3>
              <p className="text-zinc-500 mb-8">Add funds to purchase premium listings instantly.</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[5, 10, 20, 50].map((amt) => (
                  <button 
                    key={amt}
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-3 rounded-xl font-bold transition-all border ${topUpAmount === amt ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="mb-6 text-left">
                <label className="block text-sm font-bold text-zinc-700 mb-2">Custom Amount ($)</label>
                <input 
                  type="number" 
                  min="1"
                  value={topUpAmount} 
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 font-bold"
                />
              </div>

              <button 
                onClick={handleTopUp}
                disabled={isToppingUp || topUpAmount <= 0}
                className="w-full bg-zinc-900 hover:bg-black disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {isToppingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : `Simulate Checkout ($${topUpAmount})`}
              </button>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div>
              {fetchingTxs ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
              ) : (
                <div className="space-y-8">
                  
                  {/* Wallet Transactions */}
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Wallet Transactions</h3>
                    {walletTxs.length === 0 ? (
                      <p className="text-zinc-500 italic text-sm">No wallet transactions yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {walletTxs.map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-100">
                            <div>
                              <p className="font-bold text-zinc-900 text-sm">{tx.description}</p>
                              <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleString()}</p>
                            </div>
                            <div className={`font-extrabold ${tx.amount > 0 ? 'text-green-600' : 'text-zinc-900'}`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount > 0 ? '$' : '-$'}{Math.abs(tx.amount).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Credit Transactions */}
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Credit History</h3>
                    {creditTxs.length === 0 ? (
                      <p className="text-zinc-500 italic text-sm">No credit transactions yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {creditTxs.map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-100">
                            <div>
                              <p className="font-bold text-zinc-900 text-sm">{tx.reason}</p>
                              <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleString()}</p>
                            </div>
                            <div className={`font-extrabold ${tx.credits > 0 ? 'text-amber-500' : 'text-zinc-500'}`}>
                              {tx.credits > 0 ? '+' : ''}{tx.credits}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

        </div>
        
        {/* How to Earn Credits Section */}
        <div className="mt-8 bg-amber-50 rounded-2xl p-6 md:p-8 border border-amber-100">
          <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> 
            How to Earn More Credits
          </h3>
          <p className="text-amber-800 mb-6 text-sm">
            Credits are a virtual currency that you can convert to real Wallet Balance ($). Earn credits by actively engaging with our platform!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900">Sign Up Bonus</h4>
                <p className="text-sm text-zinc-500 mt-1 leading-snug">Get 1000 credits instantly when you register on our platform.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900">Make an Offer</h4>
                <p className="text-sm text-zinc-500 mt-1 leading-snug">Earn 100 credits for every serious offer you place on a property.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900">Book Viewings</h4>
                <p className="text-sm text-zinc-500 mt-1 leading-snug">Earn 50 credits each time you schedule a property viewing.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900">Other Engagements</h4>
                <p className="text-sm text-zinc-500 mt-1 leading-snug">Earn 50 credits for requesting services, info packs, or contacting agents.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
