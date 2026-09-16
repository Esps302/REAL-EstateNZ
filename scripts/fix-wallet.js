import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else {
  config();
}

async function fixWallet() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ?.replace(/\\n/g, '\n')
      ?.replace(/^"|"$/g, '');

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing Firebase credentials in .env.local');
      return;
    }

    const app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });

    const db = getFirestore(app);
    const email = 'mikepankaj@gmail.com';
    const amount = 5;

    console.log(`Searching for user with email: ${email}...`);
    const usersSnap = await db.collection('users').where('email', '==', email).get();

    if (usersSnap.empty) {
      console.log('User not found.');
      return;
    }

    const user = usersSnap.docs[0];
    const userId = user.id;
    console.log(`Found user: ${userId}. Updating wallet...`);

    const walletRef = db.collection('wallets').doc(userId);
    const txRef = db.collection('wallet_transactions').doc();
    const sessionId = 'pi_3UGF7hEXdrI2f7Oj0FR28BtL_manual_fix';

    await db.runTransaction(async (t) => {
      const walletDoc = await t.get(walletRef);
      if (walletDoc.exists) {
        const currentBalance = walletDoc.data()?.balance || 0;
        t.update(walletRef, {
          balance: currentBalance + amount,
          lastTopUpAt: Date.now(),
        });
      } else {
        t.set(walletRef, {
          id: userId,
          userId,
          balance: amount,
          credits: 1000,
          lifetimeCredits: 1000,
          lifetimeConverted: 0,
          createdAt: Date.now(),
        });
      }

      t.set(txRef, {
        id: txRef.id,
        userId,
        type: 'top_up',
        amount,
        status: 'completed',
        description: `Manual Wallet Sync ($${amount.toFixed(2)} NZD) for failed webhook`,
        stripeSessionId: sessionId,
        createdAt: Date.now(),
      });
    });

    console.log(`Successfully added $${amount} to ${email}'s wallet.`);
  } catch (error) {
    console.error('Error fixing wallet:', error);
  }
}

fixWallet();
