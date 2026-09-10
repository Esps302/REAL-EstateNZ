"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { convertCreditsToBalance } from "@/lib/wallet";
import { collection, query, where, getDocs, doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WalletTransaction, CreditTransaction } from "@/types";
import { 
  ArrowRightLeft, 
  Plus, 
  History, 
  Loader2, 
  Star, 
  UserPlus, 
  Handshake, 
  Calendar, 
  X, 
  CheckCircle2, 
  Coins, 
  CreditCard,
  Lock,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

const goldCoinAudio = typeof window !== "undefined" ? new Audio("/sounds/mixkit-gold-coin-prize-1999.wav") : null;
if (goldCoinAudio) {
  goldCoinAudio.preload = "auto";
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold text-zinc-900">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Wallet...
      </div>
    }>
      <WalletPageContent />
    </Suspense>
  );
}

function WalletPageContent() {
  const { user, wallet, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"convert" | "topup" | "history">("convert");
  
  const [isConverting, setIsConverting] = useState(false);
  const [convertAmount, setConvertAmount] = useState<number>(1000);
  
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(10);
  
  const [walletTxs, setWalletTxs] = useState<WalletTransaction[]>([]);
  const [creditTxs, setCreditTxs] = useState<CreditTransaction[]>([]);
  const [fetchingTxs, setFetchingTxs] = useState(false);
  const [successModal, setSuccessModal] = useState<{type: 'convert'|'topup', amount: number} | null>(null);

  const verifyingSessionRef = useRef<string | null>(null);

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

  // Reset any loading spinners when page is shown again (e.g. user pressed Back button in browser)
  useEffect(() => {
    const handleResetLoading = () => {
      setIsToppingUp(false);
      setIsConverting(false);
    };

    window.addEventListener("pageshow", handleResetLoading);
    window.addEventListener("focus", handleResetLoading);

    return () => {
      window.removeEventListener("pageshow", handleResetLoading);
      window.removeEventListener("focus", handleResetLoading);
    };
  }, []);

  // Handle return from Stripe Checkout
  useEffect(() => {
    if (!user) return;

    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (canceled === 'true') {
      setIsToppingUp(false);
      toast.info("Payment was canceled. Your card was not charged.");
      router.replace('/dashboard/wallet');
      return;
    }

    if (sessionId && success === 'true') {
      if (verifyingSessionRef.current === sessionId) return;
      verifyingSessionRef.current = sessionId;

      const verifyStripePayment = async () => {
        const toastId = toast.loading("Verifying your Stripe payment...");
        try {
          const res = await fetch('/api/stripe/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, userId: user.uid }),
          });

          const rawText = await res.text();
          let data: any = null;
          try {
            data = JSON.parse(rawText);
          } catch (jsonErr) {
            console.error("Non-JSON response from /api/stripe/verify-session:", rawText);
            throw new Error("Unable to parse server response.");
          }

          if (res.ok && data.success && data.verified) {
            const amountNum = Number(data.amount) || 0;
            const walletRef = doc(db, "wallets", user.uid);
            
            // Client-side idempotency check
            const txQuery = query(
              collection(db, "wallet_transactions"),
              where("stripeSessionId", "==", sessionId)
            );
            const existingTxSnap = await getDocs(txQuery);
            const isAlreadyCredited = !existingTxSnap.empty;

            if (!isAlreadyCredited) {
              await runTransaction(db, async (t) => {
                const snap = await t.get(walletRef);
                const cur = snap.exists() ? (snap.data()?.balance || 0) : 0;
                if (snap.exists()) {
                  t.update(walletRef, { balance: cur + amountNum });
                } else {
                  t.set(walletRef, {
                    id: user.uid,
                    userId: user.uid,
                    balance: amountNum,
                    credits: 1000,
                    lifetimeCredits: 1000,
                    lifetimeConverted: 0,
                    createdAt: Date.now(),
                  });
                }

                const txRef = doc(collection(db, "wallet_transactions"));
                t.set(txRef, {
                  id: txRef.id,
                  userId: user.uid,
                  type: "top_up",
                  amount: amountNum,
                  status: "completed",
                  description: `Stripe Card Top-Up ($${amountNum.toFixed(2)} NZD)`,
                  stripeSessionId: sessionId,
                  createdAt: Date.now(),
                });
              });
            }

            if (!isAlreadyCredited) {
              setSuccessModal({ type: 'topup', amount: amountNum });
              playGoldSound();
              toast.success(`Success! $${amountNum.toFixed(2)} NZD added to your wallet.`);
            } else {
              toast.info("Payment session already credited.");
            }
            fetchHistory();
          } else {
            toast.error(data.error || "Failed to verify Stripe payment.");
          }
          toast.dismiss(toastId);
        } catch (err: any) {
          toast.dismiss(toastId);
          console.error("Verification error:", err);
          toast.error(err.message || "An error occurred while verifying your payment.");
        } finally {
          router.replace('/dashboard/wallet');
        }
      };

      verifyStripePayment();
    }
  }, [user, searchParams, router]);

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
    if (topUpAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsToppingUp(true);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          amount: topUpAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to initialize Stripe checkout");
      }

      // Redirect user directly to Stripe Checkout
      setTimeout(() => {
        setIsToppingUp(false);
      }, 1500);

      window.location.href = data.url;
    } catch (err: any) {
      console.error("Top-up error:", err);
      toast.error(err.message || "Failed to start payment process");
      setIsToppingUp(false);
    }
  };

  if (loading || !user || !wallet) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold text-zinc-900">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Wallet...
      </div>
    );
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
              
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-green-50">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-extrabold text-zinc-900 mb-2">Payment Confirmed!</h2>
              
              {successModal.type === 'convert' ? (
                <p className="text-zinc-600 font-medium mb-6">
                  You successfully converted <span className="font-bold text-amber-600">{successModal.amount} Credits</span> into <span className="font-bold text-green-600">${(successModal.amount / 1000).toFixed(2)} NZD</span> balance.
                </p>
              ) : (
                <p className="text-zinc-600 font-medium mb-6">
                  You successfully topped up your wallet with <span className="font-bold text-green-600">${Number(successModal.amount).toFixed(2)} NZD</span> via Stripe!
                </p>
              )}
              
              <button 
                onClick={() => setSuccessModal(null)}
                className="w-full py-3.5 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
              >
                Awesome!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900">My Wallet</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage your funds, earn reward credits, and purchase property promotions.</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Stripe Secure Payments
          </div>
        </div>
        
        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-center relative overflow-hidden border border-zinc-700/50">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="w-36 h-36" />
            </div>
            <div className="flex items-center justify-between mb-1 relative z-10">
              <p className="text-zinc-400 font-medium text-sm">Wallet Balance</p>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-zinc-700/80 px-2.5 py-0.5 rounded-full text-zinc-200">NZD</span>
            </div>
            <h2 className="text-5xl font-extrabold relative z-10">${wallet.balance.toFixed(2)}</h2>
            <div className="mt-4 pt-4 border-t border-zinc-700/60 flex items-center justify-between text-xs text-zinc-400 relative z-10">
              <span>Ready for property listings</span>
              <button 
                onClick={() => setActiveTab("topup")}
                className="text-white hover:text-amber-400 font-bold underline transition-colors"
              >
                + Add Funds
              </button>
            </div>
          </div>
          
          <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-500">
              <Coins className="w-36 h-36" />
            </div>
            <div className="flex items-center justify-between mb-1 relative z-10">
              <p className="text-zinc-500 font-medium text-sm">Available Reward Credits</p>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Reward
              </span>
            </div>
            <h2 className="text-5xl font-extrabold text-amber-500 relative z-10">
              {wallet.credits} <span className="text-xl text-zinc-400 font-medium">Credits</span>
            </h2>
            <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 relative z-10">
              <span>Worth ${(wallet.credits / 1000).toFixed(2)} in wallet balance</span>
              <button 
                onClick={() => setActiveTab("convert")}
                className="text-amber-600 hover:text-amber-700 font-bold underline transition-colors"
              >
                Convert Now
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden mb-6 p-1 gap-1">
          <button 
            onClick={() => setActiveTab("convert")}
            className={`flex-1 py-3.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "convert" 
                ? "bg-amber-50 text-amber-800 shadow-sm border border-amber-200" 
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" /> Convert Credits
          </button>
          <button 
            onClick={() => setActiveTab("topup")}
            className={`flex-1 py-3.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "topup" 
                ? "bg-blue-50 text-blue-800 shadow-sm border border-blue-200" 
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <CreditCard className="w-4 h-4 text-blue-600" /> Top Up (Stripe)
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "history" 
                ? "bg-zinc-900 text-white shadow-sm" 
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <History className="w-4 h-4" /> History
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-6 md:p-8">
          
          {/* CONVERT TAB */}
          {activeTab === "convert" && (
            <div className="max-w-md mx-auto py-4 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ArrowRightLeft className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">Convert Credits</h3>
              <p className="text-zinc-500 mb-8 text-sm">1000 Credits = $1.00 NZD Wallet Balance</p>
              
              <div className="mb-6 text-left">
                <label className="block text-sm font-bold text-zinc-700 mb-2">Amount to convert</label>
                <input 
                  type="number" 
                  step="100"
                  min="100"
                  max={wallet.credits}
                  value={convertAmount} 
                  onChange={(e) => setConvertAmount(Number(e.target.value))}
                  className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 font-bold text-lg"
                />
              </div>

              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 mb-6 flex justify-between items-center">
                <span className="text-zinc-700 font-semibold text-sm">You will receive:</span>
                <span className="text-2xl font-extrabold text-green-700">${(convertAmount / 1000).toFixed(2)} NZD</span>
              </div>

              <button 
                onClick={handleConvert}
                disabled={isConverting || convertAmount <= 0 || convertAmount > wallet.credits}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Conversion"}
              </button>
            </div>
          )}

          {/* TOP UP TAB (STRIPE) */}
          {activeTab === "topup" && (
            <div className="max-w-md mx-auto py-4 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-1">Top Up Wallet</h3>
              <p className="text-zinc-500 text-sm mb-6">Add funds via Stripe to purchase property listing packages instantly.</p>
              
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[5, 10, 20, 50].map((amt) => (
                  <button 
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-3 rounded-xl font-extrabold transition-all text-sm border ${
                      topUpAmount === amt 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="mb-6 text-left">
                <label className="block text-sm font-bold text-zinc-700 mb-2">Custom Amount (NZD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                  <input 
                    type="number" 
                    min="1"
                    step="1"
                    value={topUpAmount} 
                    onChange={(e) => setTopUpAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 font-bold text-lg"
                  />
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 mb-6 text-left flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 font-medium">Payment Gateway</p>
                  <p className="text-sm font-bold text-zinc-900 flex items-center gap-1.5 mt-0.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    Stripe Checkout (Cards / Apple Pay / Google Pay)
                  </p>
                </div>
                <span className="text-xl font-extrabold text-zinc-900">${Number(topUpAmount).toFixed(2)}</span>
              </div>

              <button 
                onClick={handleTopUp}
                disabled={isToppingUp || topUpAmount <= 0}
                className="w-full bg-zinc-900 hover:bg-black disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-base"
              >
                {isToppingUp ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting to Stripe...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-zinc-400" />
                    Pay ${Number(topUpAmount).toFixed(2)} with Stripe
                  </>
                )}
              </button>

              <p className="text-[11px] text-zinc-400 mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-zinc-400" /> End-to-end 256-bit encrypted checkout powered by Stripe.
              </p>
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
                      <p className="text-zinc-500 italic text-sm py-4">No wallet transactions yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {walletTxs.map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-3.5 hover:bg-zinc-50 rounded-xl transition-colors border border-zinc-100">
                            <div>
                              <p className="font-bold text-zinc-900 text-sm">{tx.description}</p>
                              <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleString()}</p>
                            </div>
                            <div className={`font-extrabold text-base ${tx.amount > 0 ? 'text-green-600' : 'text-zinc-900'}`}>
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
                      <p className="text-zinc-500 italic text-sm py-4">No credit transactions yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {creditTxs.map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-3.5 hover:bg-zinc-50 rounded-xl transition-colors border border-zinc-100">
                            <div>
                              <p className="font-bold text-zinc-900 text-sm">{tx.reason}</p>
                              <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleString()}</p>
                            </div>
                            <div className={`font-extrabold text-base ${tx.credits > 0 ? 'text-amber-500' : 'text-zinc-500'}`}>
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
        <div className="mt-8 bg-amber-50/70 rounded-3xl p-6 md:p-8 border border-amber-100">
          <h3 className="text-xl font-bold text-amber-900 mb-2 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> 
            How to Earn More Credits
          </h3>
          <p className="text-amber-800 mb-6 text-sm">
            Credits are a reward currency that you can convert to real Wallet Balance ($ NZD). Earn credits by actively engaging with our platform!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900">Sign Up Bonus</h4>
                <p className="text-sm text-zinc-500 mt-1 leading-snug">Get 1000 credits instantly when you register on our platform.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900">Make an Offer</h4>
                <p className="text-sm text-zinc-500 mt-1 leading-snug">Earn 100 credits for every serious offer you place on a property.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900">Book Viewings</h4>
                <p className="text-sm text-zinc-500 mt-1 leading-snug">Earn 50 credits each time you schedule a property viewing.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
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
