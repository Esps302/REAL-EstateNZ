import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      type = 'wallet_topup', 
      amount, 
      userId, 
      propertyId, 
      serviceType, 
      plan,
      successUrl, 
      cancelUrl 
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      req.headers.get('origin') || 
      process.env.NEXT_PUBLIC_APP_URL || 
      'https://heavenbrick.com';

    let finalAmount = 0; // in dollars
    let productName = '';
    let productDescription = '';
    let metadata: Record<string, string> = {
      userId,
      type,
    };
    let defaultSuccessUrl = '';
    let defaultCancelUrl = '';

    // =========================================================================
    // 1. WALLET TOP-UP (Default existing flow)
    // =========================================================================
    if (type === 'wallet_topup') {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: 'Invalid top-up amount' }, { status: 400 });
      }
      finalAmount = numAmount;
      productName = 'RealEstate NZ - Wallet Top-Up';
      productDescription = `Top up your RealEstate NZ account wallet with $${finalAmount.toFixed(2)} NZD`;
      metadata.amount = finalAmount.toFixed(2);
      defaultSuccessUrl = `${siteUrl}/dashboard/wallet?session_id={CHECKOUT_SESSION_ID}&success=true`;
      defaultCancelUrl = `${siteUrl}/dashboard/wallet?canceled=true`;
    } 
    // =========================================================================
    // 2. PROPERTY BOOKING DEPOSIT (Server-validated price protection)
    // =========================================================================
    else if (type === 'property_booking_deposit') {
      if (!propertyId) {
        return NextResponse.json({ error: 'Property ID is required for booking deposits' }, { status: 400 });
      }

      // Fetch property from Firestore to prevent client price tampering
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
            // Standard 1% booking deposit (min $500 NZD, max $5,000 NZD)
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
        Basic: 0.50,
        Premium: 1.00,
        Featured: 5.00,
      };

      if (plan && planPrices[plan]) {
        finalAmount = planPrices[plan];
        productName = `Heaven Brick - ${plan} Listing Plan`;
        productDescription = `Fee for publishing property under ${plan} tier`;
        metadata.plan = plan;
      } else {
        finalAmount = 250.00; // Standard brokerage retainer
        productName = 'Heaven Brick - Brokerage Advisory Fee';
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
        'Property Valuation': 250.00,
        'Legal & Solicitor Review': 350.00,
        'Dedicated Agent Consultation': 150.00,
        'Building Inspection': 450.00,
      };

      const selectedService = serviceType || 'Dedicated Agent Consultation';
      finalAmount = serviceCatalog[selectedService] || 150.00;
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
              images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop&q=80'],
            },
            unit_amount: Math.round(finalAmount * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: userId,
      metadata,
      success_url: successUrl || defaultSuccessUrl,
      cancel_url: cancelUrl || defaultCancelUrl,
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
