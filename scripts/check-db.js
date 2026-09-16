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

async function checkDb() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ?.replace(/\\n/g, '\n')
      ?.replace(/^"|"$/g, '');

    const app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });

    const db = getFirestore(app);

    console.log("--- LATEST WALLET TRANSACTIONS ---");
    const txs = await db.collection('wallet_transactions').orderBy('createdAt', 'desc').limit(5).get();
    txs.forEach(doc => console.log(doc.id, '=>', doc.data()));

    console.log("\n--- LATEST NOTIFICATIONS ---");
    const notifs = await db.collection('notifications').orderBy('createdAt', 'desc').limit(5).get();
    notifs.forEach(doc => console.log(doc.id, '=>', doc.data()));

  } catch (error) {
    console.error('Error:', error);
  }
}

checkDb();
