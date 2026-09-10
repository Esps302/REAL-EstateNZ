import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, userId, successUrl, cancelUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid top-up amount' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: 'RealEstate NZ - Wallet Top-Up',
              description: `Top up your RealEstate NZ account wallet with $${numAmount.toFixed(2)} NZD`,
              images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop&q=80'],
            },
            unit_amount: Math.round(numAmount * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: userId,
      metadata: {
        userId,
        amount: numAmount.toFixed(2),
        type: 'wallet_topup',
      },
      success_url: successUrl || `${origin}/dashboard/wallet?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: cancelUrl || `${origin}/dashboard/wallet?canceled=true`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating Stripe Checkout Session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment session' },
      { status: 500 }
    );
  }
}
