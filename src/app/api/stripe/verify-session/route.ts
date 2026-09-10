import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, userId } = body;

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 }
      );
    }

    // 1. Retrieve session from Stripe
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

    // 4. Idempotency check: Ensure this stripe session hasn't been credited yet
    const existingTxSnap = await adminDb
      .collection('wallet_transactions')
      .where('stripeSessionId', '==', sessionId)
      .limit(1)
      .get();

    const amountToAdd = session.metadata?.amount
      ? parseFloat(session.metadata.amount)
      : session.amount_total
      ? session.amount_total / 100
      : 0;

    if (!existingTxSnap.empty) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        amount: amountToAdd,
        message: 'This transaction was already credited to your wallet.',
      });
    }

    // 5. Credit wallet atomically
    const walletRef = adminDb.collection('wallets').doc(userId);
    const txRef = adminDb.collection('wallet_transactions').doc();
    const notifRef = adminDb.collection('notifications').doc();
    const now = Date.now();

    await adminDb.runTransaction(async (t) => {
      const walletDoc = await t.get(walletRef);
      let currentBalance = 0;

      if (walletDoc.exists) {
        currentBalance = walletDoc.data()?.balance || 0;
        t.update(walletRef, {
          balance: currentBalance + amountToAdd,
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

      // Record transaction
      t.set(txRef, {
        id: txRef.id,
        userId,
        type: 'top_up',
        amount: amountToAdd,
        status: 'completed',
        description: `Stripe Card Top-Up ($${amountToAdd.toFixed(2)} NZD)`,
        stripeSessionId: sessionId,
        createdAt: now,
      });

      // Send in-app notification
      t.set(notifRef, {
        id: notifRef.id,
        userId,
        title: 'Wallet Funded Successfully',
        message: `Your wallet has been credited with $${amountToAdd.toFixed(2)} NZD via Stripe.`,
        type: 'success',
        isRead: false,
        isPoppedUp: false,
        link: '/dashboard/wallet',
        createdAt: now,
      });
    });

    return NextResponse.json({
      success: true,
      amount: amountToAdd,
      message: `Successfully topped up $${amountToAdd.toFixed(2)} NZD!`,
    });
  } catch (error: any) {
    console.error('Error verifying Stripe session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify session' },
      { status: 500 }
    );
  }
}
