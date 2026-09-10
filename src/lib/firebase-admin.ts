import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

function initAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin credentials not fully configured in environment.');
    return null;
  }

  try {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    return null;
  }
}

export function getAdminDb(): Firestore | null {
  const app = initAdminApp();
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch (err) {
    console.error('Failed to get Firestore from admin app:', err);
    return null;
  }
}

export function getAdminAuth(): Auth | null {
  const app = initAdminApp();
  if (!app) return null;
  try {
    return getAuth(app);
  } catch (err) {
    console.error('Failed to get Auth from admin app:', err);
    return null;
  }
}

// Safe lazy proxy for backward compatibility with existing code imports
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const db = getAdminDb();
    if (!db) {
      throw new Error('Firebase Admin DB is not initialized. Please verify FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
    }
    const val = (db as any)[prop];
    return typeof val === 'function' ? val.bind(db) : val;
  }
});

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = getAdminAuth();
    if (!auth) {
      throw new Error('Firebase Admin Auth is not initialized. Please verify FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
    }
    const val = (auth as any)[prop];
    return typeof val === 'function' ? val.bind(auth) : val;
  }
});
