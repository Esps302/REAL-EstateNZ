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

async function fixNotification() {
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
    const amount = 5;
    const userEmail = 'mikepankaj@gmail.com';
    const userName = 'Pankaj Singh';

    const adminNotifRef = db.collection('notifications').doc();
    await adminNotifRef.set({
      id: adminNotifRef.id,
      userId: 'admin_system',
      title: 'New Wallet Top-Up Received',
      message: `${userName} (${userEmail}) topped up $${amount.toFixed(2)} NZD via Stripe.`,
      type: 'success',
      isRead: false,
      isPoppedUp: false,
      link: '/admin/economy',
      createdAt: Date.now(),
    });

    console.log(`Successfully added admin notification.`);
  } catch (error) {
    console.error('Error fixing notification:', error);
  }
}

fixNotification();
