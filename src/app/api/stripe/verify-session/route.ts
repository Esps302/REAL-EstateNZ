import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

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

    const amountToAdd = session.metadata?.amount
      ? parseFloat(session.metadata.amount)
      : session.amount_total
      ? session.amount_total / 100
      : 0;

    return NextResponse.json({
      success: true,
      verified: true,
      amount: amountToAdd,
      sessionId: session.id,
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
