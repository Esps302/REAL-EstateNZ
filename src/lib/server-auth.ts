import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export const SUPER_ADMIN_EMAILS = [
  'sanjay00002023@gmail.com',
  'realestatenz01@gmail.com',
  'info@spsolutions.org.nz',
  'sanjayranatanabana@gmail.com',
  'sanjayrana00002023@gmail.com',
];

export interface VerifiedRequestUser {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}

/**
 * Verifies a Firebase ID token passed in the Authorization: Bearer <token> header.
 * Returns null if no token is present or verification fails.
 */
export async function verifyFirebaseBearerToken(
  request: Request
): Promise<VerifiedRequestUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase() ?? null;
    let isAdmin = Boolean(email && SUPER_ADMIN_EMAILS.includes(email));

    if (!isAdmin) {
      const adminDb = getAdminDb();
      if (adminDb) {
        const userSnap = await adminDb.collection('users').doc(decoded.uid).get();
        if (userSnap.exists) {
          const role = userSnap.data()?.role;
          if (role === 'admin' || role === 'super_admin') {
            isAdmin = true;
          }
        }
      }
    }

    return {
      uid: decoded.uid,
      email,
      isAdmin,
    };
  } catch (err) {
    console.warn('[server-auth] Firebase ID token verification failed:', err);
    return null;
  }
}

/**
 * Checks whether the request comes from an allowed same-site origin (basic CSRF/abuse guard).
 */
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Same-origin or server-to-server calls without Origin header

  const allowedOrigins = new Set<string>([
    'https://heavenbrick.com',
    'https://www.heavenbrick.com',
    'capacitor://localhost',
    'http://localhost',
    'https://localhost',
  ]);

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      allowedOrigins.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
    } catch {
      // ignore invalid URL
    }
  }
  if (process.env.VERCEL_URL) {
    allowedOrigins.add(`https://${process.env.VERCEL_URL}`);
  }

  if (allowedOrigins.has(origin)) return true;

  // Also allow local dev on any port and Vercel deployments for this project
  try {
    const parsed = new URL(origin);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return true;
    }
    if (parsed.hostname.endsWith('.vercel.app') && parsed.protocol === 'https:') {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
