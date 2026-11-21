import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { verifyFirebaseBearerToken } from '@/lib/server-auth';
import { getAdminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

function getSafeRedirectUrl(candidate: unknown, fallback: string, allowedBase: string): string {
  if (typeof candidate !== 'string' || !candidate) return fallback;
  try {
    const parsedCandidate = new URL(candidate);
    const parsedBase = new URL(allowedBase);
    if (parsedCandidate.origin === parsedBase.origin) {
      return candidate;
    }
  } catch {
    // fallback if invalid URL
  }
  return fallback;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type = 'wallet_topup',
      amount,
      userId: bodyUserId,
      propertyId,
      serviceType,
      plan,
      successUrl,
      cancelUrl,
    } = body;

    // Verify Firebase ID token when Firebase Admin Auth is configured
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

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://www.heavenbrick.com'
    ).replace(/\/+$/, '');

    let finalAmount = 0; // in dollars
    let productName = '';
    let productDescription = '';
    const metadata: Record<string, string> = {
      userId,
      type,
    };
    let defaultSuccessUrl = '';
    let defaultCancelUrl = '';

    // =========================================================================
    // 1. WALLET TOP-UP
    // =========================================================================
    if (type === 'wallet_topup') {
      const numAmount = Number(amount);
      if (!Number.isFinite(numAmount) || numAmount < 1 || numAmount > 100000) {
        return NextResponse.json(
          { error: 'Top-up amount must be between $1 and $100,000 NZD' },
          { status: 400 }
        );
      }
      finalAmount = Math.round(numAmount * 100) / 100;
      productName = 'Heaven Bricks - Wallet Top-Up';
      productDescription = `Top up your Heaven Bricks account wallet with $${finalAmount.toFixed(2)} NZD`;
      metadata.amount = finalAmount.toFixed(2);
      defaultSuccessUrl = `${siteUrl}/dashboard/wallet?session_id={CHECKOUT_SESSION_ID}&success=true`;
      defaultCancelUrl = `${siteUrl}/dashboard/wallet?canceled=true`;
    }
    // =========================================================================
    // 2. PROPERTY BOOKING DEPOSIT (Server-validated price protection)
    // =========================================================================
    else if (type === 'property_booking_deposit') {
      if (!propertyId) {
        return NextResponse.json(
          { error: 'Property ID is required for booking deposits' },
          { status: 400 }
        );
      }

      let propTitle = 'Property Booking';
      let propPrice = 0;
      let calculatedDeposit = 1000; // Default $1,000 NZD holding deposit

      try {
        const propSnap = await getDoc(doc(db, 'properties', propertyId));
        if (propSnap.exists()) {
          const pData = propSnap.data();
          propTitle = pData.title || propTitle;
          propPrice = Number(pData.price) || 0;
          if (pData.bookingDeposit && Number(pData.bookingDeposit) > 0) {
            calculatedDeposit = Number(pData.bookingDeposit);
          } else if (propPrice > 0) {
            calculatedDeposit = Math.max(500, Math.min(5000, Math.round(propPrice * 0.01)));
          }
        }
      } catch (err) {
        console.warn('Could not fetch property doc for deposit calculation, using standard deposit:', err);
      }

      finalAmount = calculatedDeposit;
      productName = `Booking Deposit - ${propTitle}`;
      productDescription = `Official holding deposit for property: ${propTitle} ($${finalAmount.toFixed(2)} NZD)`;
      metadata.propertyId = propertyId;
      metadata.propertyTitle = propTitle;
      metadata.amount = finalAmount.toFixed(2);
      defaultSuccessUrl = `${siteUrl}/property/${propertyId}?session_id={CHECKOUT_SESSION_ID}&deposit_success=true`;
      defaultCancelUrl = `${siteUrl}/property/${propertyId}?canceled=true`;
    }
    // =========================================================================
    // 3. BROKERAGE FEE (Listing plans or commission retainers)
    // =========================================================================
    else if (type === 'brokerage_fee') {
      const planPrices: Record<string, number> = {
        Basic: 0.5,
        Premium: 1.0,
        Featured: 5.0,
      };

      if (plan && planPrices[plan]) {
        finalAmount = planPrices[plan];
        productName = `Heaven Bricks - ${plan} Listing Plan`;
        productDescription = `Fee for publishing property under ${plan} tier`;
        metadata.plan = plan;
      } else {
        finalAmount = 250.0;
        productName = 'Heaven Bricks - Brokerage Advisory Fee';
        productDescription = 'Professional real estate brokerage and advisory services retainer';
      }

      if (propertyId) metadata.propertyId = propertyId;
      metadata.amount = finalAmount.toFixed(2);
      defaultSuccessUrl = `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&brokerage_success=true`;
      defaultCancelUrl = `${siteUrl}/dashboard?canceled=true`;
    }
    // =========================================================================
    // 4. AGENT SERVICE FEE (Consultations, valuations, solicitor reviews)
    // =========================================================================
    else if (type === 'agent_service_fee') {
      const serviceCatalog: Record<string, number> = {
        'Property Valuation': 250.0,
        'Legal & Solicitor Review': 350.0,
        'Dedicated Agent Consultation': 150.0,
        'Building Inspection': 450.0,
      };

      const selectedService = serviceType || 'Dedicated Agent Consultation';
      finalAmount = serviceCatalog[selectedService] || 150.0;
      productName = `Agent Service - ${selectedService}`;
      productDescription = `Fee for requested professional real estate service: ${selectedService}`;

      metadata.serviceType = selectedService;
      if (propertyId) metadata.propertyId = propertyId;
      metadata.amount = finalAmount.toFixed(2);
      defaultSuccessUrl = `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&service_success=true`;
      defaultCancelUrl = `${siteUrl}/dashboard?canceled=true`;
    } else {
      return NextResponse.json({ error: `Unsupported payment type: ${type}` }, { status: 400 });
    }

    // =========================================================================
    // Create Stripe Checkout Session
    // =========================================================================
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      adaptive_pricing: {
        enabled: false,
      },
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: productName,
              description: productDescription,
              images: [
                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop&q=80',
              ],
            },
            unit_amount: Math.round(finalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: userId,
      metadata,
      success_url: getSafeRedirectUrl(successUrl, defaultSuccessUrl, siteUrl),
      cancel_url: getSafeRedirectUrl(cancelUrl, defaultCancelUrl, siteUrl),
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
