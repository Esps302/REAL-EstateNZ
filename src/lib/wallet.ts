import { db } from "./firebase";
import { doc, getDoc, setDoc, runTransaction, collection } from "firebase/firestore";
import { Wallet, WalletTransaction, CreditTransaction } from "@/types";
import { toast } from "sonner";

/**
 * Initializes a wallet for a user if it doesn't exist, granting 1000 welcome credits.
 */
export async function initializeWallet(userId: string): Promise<Wallet | null> {
  if (!userId) return null;
  const walletRef = doc(db, "wallets", userId);
  const snap = await getDoc(walletRef);
  
  if (!snap.exists()) {
    const newWallet: Wallet = {
      id: userId,
      userId,
      balance: 0,
      credits: 1000,
      lifetimeCredits: 1000,
      lifetimeConverted: 0,
      createdAt: Date.now()
    };
    await setDoc(walletRef, newWallet);
    
    // Log credit transaction
    const creditRef = doc(collection(db, "credit_transactions"));
    await setDoc(creditRef, {
      id: creditRef.id,
      userId,
      credits: 1000,
      reason: "Welcome Bonus",
      createdAt: Date.now()
    } as CreditTransaction);
    // Trigger a custom event for the Reward Popup
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("rewardEarned", { detail: { amount: 1000, reason: "Welcome Bonus" } }));
    }
    
    return newWallet;
  }
  
  return snap.data() as Wallet;
}

/**
 * Awards credits to a user securely.
 */
export async function awardCredits(userId: string, amount: number, reason: string): Promise<boolean> {
  if (!userId || amount <= 0) return false;
  const walletRef = doc(db, "wallets", userId);
  
  try {
    await runTransaction(db, async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      if (!walletDoc.exists()) {
        throw new Error("Wallet does not exist");
      }
      
      const data = walletDoc.data();
      const lastCreditEarnedAt = data.lastCreditEarnedAt || 0;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      // Enforce 24-hour cooldown for earning credits
      if (Date.now() - lastCreditEarnedAt < twentyFourHours) {
        throw new Error("COOLDOWN_ACTIVE");
      }
      
      const currentCredits = data.credits || 0;
      const currentLifetime = data.lifetimeCredits || 0;
      
      transaction.update(walletRef, {
        credits: currentCredits + amount,
        lifetimeCredits: currentLifetime + amount,
        lastCreditEarnedAt: Date.now()
      });
      
      const creditRef = doc(collection(db, "credit_transactions"));
      transaction.set(creditRef, {
        id: creditRef.id,
        userId,
        credits: amount,
        reason,
        createdAt: Date.now()
      } as CreditTransaction);
    });
    
    // Trigger a custom event for the Reward Popup
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("rewardEarned", { detail: { amount, reason } }));
    }
    
    return true;
  } catch (e: any) {
    if (e.message === "COOLDOWN_ACTIVE") {
      toast.info("You've already earned credits recently! Please wait 24 hours between earning credits.");
      return false;
    }
    console.error("Failed to award credits:", e);
    return false;
  }
}

/**
 * Converts credits into wallet balance using the given conversion rate.
 */
export async function convertCreditsToBalance(userId: string, creditsToConvert: number, conversionRate: number = 1000): Promise<boolean> {
  if (!userId || creditsToConvert <= 0) return false;
  const walletRef = doc(db, "wallets", userId);
  
  try {
    await runTransaction(db, async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      if (!walletDoc.exists()) throw new Error("Wallet not found");
      
      const data = walletDoc.data() as Wallet;
      if (data.credits < creditsToConvert) throw new Error("Insufficient credits");
      
      const usdValue = creditsToConvert / conversionRate;
      
      transaction.update(walletRef, {
        credits: data.credits - creditsToConvert,
        balance: data.balance + usdValue,
        lifetimeConverted: (data.lifetimeConverted || 0) + creditsToConvert
      });
      
      const creditRef = doc(collection(db, "credit_transactions"));
      transaction.set(creditRef, {
        id: creditRef.id,
        userId,
        credits: -creditsToConvert,
        reason: "Converted to Wallet Balance",
        createdAt: Date.now()
      } as CreditTransaction);
      
      const walletTxRef = doc(collection(db, "wallet_transactions"));
      transaction.set(walletTxRef, {
        id: walletTxRef.id,
        userId,
        type: "credit_conversion",
        amount: usdValue,
        status: "completed",
        description: `Converted ${creditsToConvert} Credits`,
        createdAt: Date.now()
      } as WalletTransaction);
    });
    return true;
  } catch (e) {
    console.error("Failed to convert credits:", e);
    return false;
  }
}

/**
 * Simulates topping up the wallet with real money.
 */
export async function simulateTopUpWallet(userId: string, amount: number): Promise<boolean> {
  if (!userId || amount <= 0) return false;
  const walletRef = doc(db, "wallets", userId);
  
  try {
    await runTransaction(db, async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      if (!walletDoc.exists()) throw new Error("Wallet not found");
      
      const currentBalance = walletDoc.data().balance || 0;
      
      transaction.update(walletRef, {
        balance: currentBalance + amount
      });
      
      const walletTxRef = doc(collection(db, "wallet_transactions"));
      transaction.set(walletTxRef, {
        id: walletTxRef.id,
        userId,
        type: "top_up",
        amount,
        status: "completed",
        description: "Simulated Top Up via Card",
        createdAt: Date.now()
      } as WalletTransaction);
    });
    return true;
  } catch (e) {
    console.error("Failed to top up wallet:", e);
    return false;
  }
}

/**
 * Purchases a property listing and publishes it.
 */
export async function purchaseListing(userId: string, propertyData: any, plan: "Basic" | "Premium" | "Featured", price: number): Promise<boolean> {
  if (!userId) return false;
  const walletRef = doc(db, "wallets", userId);
  
  try {
    await runTransaction(db, async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      if (!walletDoc.exists()) throw new Error("Wallet not found");
      
      const currentBalance = walletDoc.data().balance || 0;
      if (currentBalance < price) throw new Error("Insufficient Wallet Balance");
      
      // Deduct balance
      transaction.update(walletRef, {
        balance: currentBalance - price
      });
      
      // Record transaction
      const walletTxRef = doc(collection(db, "wallet_transactions"));
      transaction.set(walletTxRef, {
        id: walletTxRef.id,
        userId,
        type: "listing_purchase",
        amount: -price,
        status: "completed",
        description: `${plan} Listing Purchase`,
        createdAt: Date.now()
      } as WalletTransaction);
      
      // Create property
      const propertyRef = doc(collection(db, "properties"));
      
      // If featured, calculate featuredUntil (e.g. 30 days from now)
      const featuredUntil = plan === "Featured" ? Date.now() + (30 * 24 * 60 * 60 * 1000) : undefined;
      
      transaction.set(propertyRef, {
        ...propertyData,
        id: propertyRef.id,
        plan,
        featuredUntil
      });
    });
    return true;
  } catch (e) {
    console.error("Failed to purchase listing:", e);
    throw e;
  }
}
