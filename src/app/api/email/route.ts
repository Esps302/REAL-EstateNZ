import { NextResponse } from 'next/server';
import { sendEmail, templates } from '@/lib/email';
import { isAllowedOrigin, verifyFirebaseBearerToken } from '@/lib/server-auth';
import { getAdminAuth } from '@/lib/firebase-admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'realestatenz01@gmail.com';

// Simple in-memory IP rate limiter (10 email requests per minute per IP)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitStore = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitStore.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);
  return false;
}

const PUBLIC_ADMIN_ONLY_TEMPLATES = new Set(['agentRequested', 'serviceRequested']);
const USER_SELF_TEMPLATES = new Set([
  'welcomeConfirmation',
  'offerSubmitted',
  'userActionConfirmation',
]);
const ADMIN_ONLY_TEMPLATES = new Set([
  'adminNotificationToUser',
  'paymentReceiptUser',
  'paymentAlertAdmin',
]);

export async function POST(request: Request) {
  try {
    // 1. Origin check to block cross-site abuse
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    // 2. Rate limiting per client IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { to, userId, templateType, payload } = body;

    if (!templateType || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields (templateType, payload)' },
        { status: 400 }
      );
    }

    // 3. Enforce per-template authorization so this endpoint can NEVER be used as an open relay
    if (PUBLIC_ADMIN_ONLY_TEMPLATES.has(templateType)) {
      // Guest inquiry forms are strictly locked to ADMIN_EMAIL regardless of body.to
      to = ADMIN_EMAIL;
    } else if (USER_SELF_TEMPLATES.has(templateType)) {
      const adminAuthAvailable = Boolean(getAdminAuth());
      if (adminAuthAvailable) {
        const verifiedUser = await verifyFirebaseBearerToken(request);
        if (!verifiedUser) {
          return NextResponse.json(
            { error: 'Unauthorized: Valid user session required' },
            { status: 401 }
          );
        }
        // Regular users can only trigger self-confirmation emails to their own verified email
        if (!verifiedUser.isAdmin) {
          if (!verifiedUser.email) {
            return NextResponse.json(
              { error: 'Verified user email not found' },
              { status: 400 }
            );
          }
          to = verifiedUser.email;
          userId = verifiedUser.uid;
        }
      }
    } else if (ADMIN_ONLY_TEMPLATES.has(templateType)) {
      const adminAuthAvailable = Boolean(getAdminAuth());
      if (adminAuthAvailable) {
        const verifiedUser = await verifyFirebaseBearerToken(request);
        if (!verifiedUser || !verifiedUser.isAdmin) {
          return NextResponse.json(
            { error: 'Forbidden: Admin access required' },
            { status: 403 }
          );
        }
      }
    } else {
      return NextResponse.json({ error: 'Invalid template type' }, { status: 400 });
    }

    // Server-Side Email Lookup if 'to' is missing but 'userId' is provided
    if (!to && userId) {
      try {
        const { getAdminDb } = await import('@/lib/firebase-admin');
        const adminDb = getAdminDb();
        if (adminDb) {
          const userDoc = await adminDb.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            to = userData?.email;
            if (!payload.userName) {
              payload.userName = userData?.name || 'Valued Client';
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch user from adminDb for email lookup', err);
      }
    }

    if (!to) {
      return NextResponse.json(
        { error: 'Missing required recipient email' },
        { status: 400 }
      );
    }

    let subject = '';
    let htmlContent = '';

    // Route to the correct template
    switch (templateType) {
      case 'welcomeConfirmation':
        subject = 'Welcome to Heaven Bricks | Premium Real Estate Brokerage';
        htmlContent = templates.welcomeConfirmation(payload.userName, payload.role);
        break;
      case 'offerSubmitted':
        subject = 'Offer Successfully Submitted - Heaven Bricks';
        htmlContent = templates.offerSubmitted(
          payload.userName,
          payload.propertyTitle,
          payload.offerAmount
        );
        break;
      case 'agentRequested':
        subject = 'New Agent Request - Lead Generated';
        htmlContent = templates.agentRequested(
          payload.name,
          payload.email,
          payload.phone,
          payload.interest,
          payload.region,
          payload.requirements
        );
        break;
      case 'serviceRequested':
        subject = 'New Service Request - Heaven Bricks';
        htmlContent = templates.serviceRequested(
          payload.name,
          payload.email,
          payload.phone,
          payload.serviceType,
          payload.propertyAddress
        );
        break;
      case 'userActionConfirmation':
        subject = payload.title || 'Request Received - Heaven Bricks';
        htmlContent = templates.userActionConfirmation(
          payload.userName,
          payload.actionTitle,
          payload.actionMessage,
          payload.link,
          payload.actionDetails
        );
        break;
      case 'adminNotificationToUser':
        subject = payload.title || 'Important Update - Heaven Bricks';
        htmlContent = templates.adminNotificationToUser(
          payload.userName,
          payload.updateTitle,
          payload.updateMessage,
          payload.link,
          payload.status
        );
        break;
      case 'paymentReceiptUser':
        subject =
          payload.title ||
          `Payment Receipt - $${Number(payload.amount).toFixed(2)} NZD | Heaven Bricks`;
        htmlContent = templates.paymentReceiptUser(
          payload.userName,
          Number(payload.amount),
          payload.paymentTypeDescription,
          payload.referenceId,
          payload.itemDescription
        );
        break;
      case 'paymentAlertAdmin':
        subject =
          payload.title ||
          `[NEW REVENUE] $${Number(payload.amount).toFixed(2)} NZD Received from ${payload.userName}`;
        htmlContent = templates.paymentAlertAdmin(
          payload.userName,
          payload.userEmail,
          Number(payload.amount),
          payload.paymentType,
          payload.referenceId,
          payload.details
        );
        break;
      default:
        return NextResponse.json({ error: 'Invalid template type' }, { status: 400 });
    }

    const result = await sendEmail(to, subject, htmlContent);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      console.error('Email sending failed:', result.error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    console.error('API /email error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
