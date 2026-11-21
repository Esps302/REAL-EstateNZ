import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { verifyFirebaseBearerToken } from '@/lib/server-auth';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, userId: bodyUserId } = body;

    // Verify Firebase ID token when Firebase Admin Auth is available
    let userId: string | undefined;
    if (getAdminAuth()) {
      const verifiedUser = await verifyFirebaseBearerToken(req);
      if (!verifiedUser) {
        return NextResponse.json(
          { error: 'Unauthorized: Valid login session required' },
          { status: 401 }
        );
      }
      userId = verifiedUser.uid;
    } else {
      userId = bodyUserId;
    }

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 }
      );
    }

    // 1. Retrieve session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Stripe checkout session not found' },
        { status: 404 }
      );
    }

    // 2. Validate payment status
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment has not been completed', paymentStatus: session.payment_status },
        { status: 400 }
      );
    }

    // 3. Validate user ownership
    if (
      session.client_reference_id !== userId &&
      session.metadata?.userId !== userId
    ) {
      return NextResponse.json(
        { error: 'User mismatch for this checkout session' },
        { status: 403 }
      );
    }

    const amountToAdd = session.amount_total
      ? session.amount_total / 100
      : session.metadata?.amount
      ? parseFloat(session.metadata.amount)
      : 0;

    // 4. Atomically credit the wallet on the server (using deterministic tx doc ID shared with webhook)
    const paymentType = session.metadata?.type || 'wallet_topup';
    let creditedOnServer = false;
    let alreadyProcessed = false;

    const adminDb = getAdminDb();
    if (adminDb && paymentType === 'wallet_topup' && amountToAdd > 0) {
      const txDocId = `stripe_${session.id}`;
      const txRef = adminDb.collection('wallet_transactions').doc(txDocId);
      const walletRef = adminDb.collection('wallets').doc(userId);
      const now = Date.now();

      await adminDb.runTransaction(async (t) => {
        const existingTx = await t.get(txRef);
        if (existingTx.exists) {
          alreadyProcessed = true;
          return;
        }

        const walletDoc = await t.get(walletRef);
        if (walletDoc.exists) {
          const currentBalance = walletDoc.data()?.balance || 0;
          t.update(walletRef, {
            balance: currentBalance + amountToAdd,
            lastTopUpAt: now,
          });
        } else {
          t.set(walletRef, {
            id: userId,
            userId,
            balance: amountToAdd,
            credits: 1000,
            lifetimeCredits: 1000,
            lifetimeConverted: 0,
            createdAt: now,
          });
        }

        t.set(txRef, {
          id: txDocId,
          userId,
          type: 'top_up',
          amount: amountToAdd,
          status: 'completed',
          description: `Stripe Card Top-Up ($${amountToAdd.toFixed(2)} NZD)`,
          stripeSessionId: session.id,
          createdAt: now,
        });
      });

      creditedOnServer = true;
    }

    return NextResponse.json({
      success: true,
      verified: true,
      amount: amountToAdd,
      sessionId: session.id,
      creditedOnServer,
      alreadyProcessed,
      message: `Payment verified ($${amountToAdd.toFixed(2)} NZD).`,
    });
  } catch (error: any) {
    console.error('Error verifying Stripe session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify session' },
      { status: 500 }
    );
  }
}
