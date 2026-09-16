import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { sendEmail, templates } from '@/lib/email';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'Info@spsolutions.org.nz';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    // 1. Verify webhook signature when secret is configured
    if (webhookSecret && !webhookSecret.startsWith('whsec_dummy')) {
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing stripe-signature header' },
          { status: 400 }
        );
      }
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error(`⚠️ Webhook signature verification failed:`, err.message);
        return NextResponse.json(
          { error: `Webhook signature verification failed: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      console.warn('⚠️ STRIPE_WEBHOOK_SECRET not set or dummy. Parsing payload directly.');
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch (err: any) {
        return NextResponse.json(
          { error: 'Invalid JSON payload' },
          { status: 400 }
        );
      }
    }

    // 2. Handle checkout session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only fulfill paid sessions
      if (session.payment_status !== 'paid') {
        console.log(`[Webhook] Session ${session.id} payment_status is '${session.payment_status}', skipping fulfillment.`);
        return NextResponse.json({ received: true });
      }

      const userId = session.client_reference_id || session.metadata?.userId;
      const paymentType = session.metadata?.type || 'wallet_topup';
      const sessionId = session.id;
      const amount = session.amount_total
        ? session.amount_total / 100
        : parseFloat(session.metadata?.amount || '0');

      // Dynamically load firebase-admin to prevent top-level serverless bundling crash
      let adminDb: any = null;
      try {
        const adminMod = await import('@/lib/firebase-admin');
        adminDb = adminMod.getAdminDb();
      } catch (err) {
        console.warn('[Webhook] Could not load firebase-admin dynamically:', err);
      }

      if (!adminDb) {
        console.warn('[Webhook] Server DB uninitialized. Fulfillment will be handled by client verify-session flow.');
        return NextResponse.json({ received: true, note: 'Fulfillment delegated to verify flow' });
      }

      // Fetch user name and email for receipts and alerts
      let userEmail = session.customer_details?.email || session.metadata?.email || '';
      let userName = session.customer_details?.name || session.metadata?.name || 'Valued Client';

      if (userId && (!userEmail || userName === 'Valued Client')) {
        try {
          const uSnap = await adminDb.collection('users').doc(userId).get();
          if (uSnap.exists) {
            const uData = uSnap.data();
            if (!userEmail && uData?.email) userEmail = uData.email;
            if (userName === 'Valued Client' && uData?.name) userName = uData.name;
          }
        } catch (err) {
          console.warn('[Webhook] User lookup error:', err);
        }
      }

      const now = Date.now();

      // =======================================================================
      // 1. WALLET TOP-UP (Strict Idempotency Protection)
      // =======================================================================
      if (paymentType === 'wallet_topup') {
        const existingTxSnap = await adminDb
          .collection('wallet_transactions')
          .where('stripeSessionId', '==', sessionId)
          .limit(1)
          .get();

        if (!existingTxSnap.empty) {
          console.log(`[Webhook Idempotency] Session ${sessionId} already credited. Skipping duplicate top-up.`);
          return NextResponse.json({ received: true, alreadyProcessed: true });
        }

        if (userId && amount > 0) {
          const walletRef = adminDb.collection('wallets').doc(userId);
          const txRef = adminDb.collection('wallet_transactions').doc();
          const userNotifRef = adminDb.collection('notifications').doc();
          const adminNotifRef = adminDb.collection('notifications').doc();

          await adminDb.runTransaction(async (t: any) => {
            const walletDoc = await t.get(walletRef);

            if (walletDoc.exists) {
              const currentBalance = walletDoc.data()?.balance || 0;
              t.update(walletRef, {
                balance: currentBalance + amount,
                lastTopUpAt: now,
              });
            } else {
              t.set(walletRef, {
                id: userId,
                userId,
                balance: amount,
                credits: 1000,
                lifetimeCredits: 1000,
                lifetimeConverted: 0,
                createdAt: now,
              });
            }

            t.set(txRef, {
              id: txRef.id,
              userId,
              type: 'top_up',
              amount,
              status: 'completed',
              description: `Stripe Card Top-Up ($${amount.toFixed(2)} NZD) [Webhook]`,
              stripeSessionId: sessionId,
              createdAt: now,
            });

            // User in-app notification
            t.set(userNotifRef, {
              id: userNotifRef.id,
              userId,
              title: 'Wallet Funded Successfully',
              message: `Your wallet has been credited with $${amount.toFixed(2)} NZD via Stripe.`,
              type: 'success',
              isRead: false,
              isPoppedUp: false,
              link: '/dashboard/wallet',
              createdAt: now,
            });

            // Admin in-app notification
            t.set(adminNotifRef, {
              id: adminNotifRef.id,
              userId: 'admin_system',
              title: 'New Wallet Top-Up Received',
              message: `${userName} (${userEmail || userId}) topped up $${amount.toFixed(2)} NZD via Stripe.`,
              type: 'success',
              isRead: false,
              isPoppedUp: false,
              link: '/admin/economy',
              createdAt: now,
            });
          });

          // Send Email Receipts & Alerts asynchronously
          if (userEmail) {
            const userReceipt = templates.paymentReceiptUser(
              userName,
              amount,
              'Digital Wallet Top-Up',
              sessionId,
              'Account Credit'
            );
            sendEmail(
              userEmail,
              `Receipt: $${amount.toFixed(2)} NZD Wallet Top-Up | Heaven Bricks`,
              userReceipt
            ).catch((e) => console.error('[Email error user top-up receipt]:', e));
          }

          const adminAlert = templates.paymentAlertAdmin(
            userName,
            userEmail || 'Not Provided',
            amount,
            'Wallet Top-Up',
            sessionId,
            'Account Credit Funds'
          );
          sendEmail(
            ADMIN_EMAIL,
            `[PAYMENT ALERT] $${amount.toFixed(2)} NZD from ${userName}`,
            adminAlert
          ).catch((e) => console.error('[Email error admin alert]:', e));

          console.log(`[Webhook] Successfully credited $${amount.toFixed(2)} NZD to user ${userId} and sent emails.`);
        }
      } 
      // =======================================================================
      // 2. PROPERTY BOOKING DEPOSIT
      // =======================================================================
      else if (paymentType === 'property_booking_deposit') {
        const propertyId = session.metadata?.propertyId;
        const propTitle = session.metadata?.propertyTitle || 'Property Listing';

        const existingDeposit = await adminDb.collection('property_deposits').doc(sessionId).get();
        if (existingDeposit.exists) {
          console.log(`[Webhook Idempotency] Booking deposit for session ${sessionId} already recorded.`);
          return NextResponse.json({ received: true, alreadyProcessed: true });
        }

        await adminDb.collection('property_deposits').doc(sessionId).set({
          id: sessionId,
          sessionId,
          userId: userId || null,
          propertyId: propertyId || null,
          propertyTitle: propTitle,
          amount,
          currency: 'NZD',
          status: 'confirmed',
          createdAt: now,
        });

        // User in-app notification
        if (userId) {
          const userNotifRef = adminDb.collection('notifications').doc();
          await userNotifRef.set({
            id: userNotifRef.id,
            userId,
            title: 'Holding Deposit Confirmed',
            message: `Your holding deposit of $${amount.toFixed(2)} NZD for "${propTitle}" has been received.`,
            type: 'success',
            isRead: false,
            isPoppedUp: false,
            link: propertyId ? `/property/${propertyId}` : '/dashboard',
            createdAt: now,
          });
        }

        // Admin in-app notification
        const adminNotifRef = adminDb.collection('notifications').doc();
        await adminNotifRef.set({
          id: adminNotifRef.id,
          userId: 'admin_system',
          title: 'New Property Holding Deposit Received',
          message: `$${amount.toFixed(2)} NZD deposit received from ${userName} (${userEmail}) for "${propTitle}".`,
          type: 'success',
          isRead: false,
          isPoppedUp: false,
          link: propertyId ? `/property/${propertyId}` : '/admin/properties',
          createdAt: now,
        });

        // Send Email Receipts & Alerts
        if (userEmail) {
          const userReceipt = templates.paymentReceiptUser(
            userName,
            amount,
            'Property Holding / Booking Deposit',
            sessionId,
            propTitle
          );
          sendEmail(
            userEmail,
            `Deposit Confirmed: $${amount.toFixed(2)} NZD for ${propTitle} | Heaven Bricks`,
            userReceipt
          ).catch((e) => console.error('[Email error user deposit receipt]:', e));
        }

        const adminAlert = templates.paymentAlertAdmin(
          userName,
          userEmail || 'Not Provided',
          amount,
          'Property Holding Deposit',
          sessionId,
          `Property: ${propTitle}`
        );
        sendEmail(
          ADMIN_EMAIL,
          `[DEPOSIT RECEIVED] $${amount.toFixed(2)} NZD for ${propTitle}`,
          adminAlert
        ).catch((e) => console.error('[Email error admin deposit alert]:', e));

        console.log(`[Webhook] Confirmed booking deposit of $${amount.toFixed(2)} NZD for property ${propertyId}`);
      } 
      // =======================================================================
      // 3. BROKERAGE / AGENT SERVICE FEES
      // =======================================================================
      else if (paymentType === 'brokerage_fee' || paymentType === 'agent_service_fee') {
        const existingFee = await adminDb.collection('service_payments').doc(sessionId).get();
        if (existingFee.exists) {
          console.log(`[Webhook Idempotency] Service fee for session ${sessionId} already recorded.`);
          return NextResponse.json({ received: true, alreadyProcessed: true });
        }

        const serviceName = session.metadata?.serviceType || session.metadata?.plan || 'Real Estate Service Fee';

        await adminDb.collection('service_payments').doc(sessionId).set({
          id: sessionId,
          sessionId,
          userId: userId || null,
          type: paymentType,
          serviceName,
          propertyId: session.metadata?.propertyId || null,
          amount,
          currency: 'NZD',
          status: 'completed',
          createdAt: now,
        });

        // User in-app notification
        if (userId) {
          const userNotifRef = adminDb.collection('notifications').doc();
          await userNotifRef.set({
            id: userNotifRef.id,
            userId,
            title: 'Service Fee Payment Confirmed',
            message: `Your payment of $${amount.toFixed(2)} NZD for "${serviceName}" has been received.`,
            type: 'success',
            isRead: false,
            isPoppedUp: false,
            link: '/dashboard',
            createdAt: now,
          });
        }

        // Admin in-app notification
        const adminNotifRef = adminDb.collection('notifications').doc();
        await adminNotifRef.set({
          id: adminNotifRef.id,
          userId: 'admin_system',
          title: 'New Service Payment Received',
          message: `$${amount.toFixed(2)} NZD received for "${serviceName}" from ${userName} (${userEmail}).`,
          type: 'success',
          isRead: false,
          isPoppedUp: false,
          link: '/admin/economy',
          createdAt: now,
        });

        // Send Email Receipts & Alerts
        if (userEmail) {
          const userReceipt = templates.paymentReceiptUser(
            userName,
            amount,
            serviceName,
            sessionId,
            'Brokerage Professional Services'
          );
          sendEmail(
            userEmail,
            `Service Fee Receipt: $${amount.toFixed(2)} NZD | Heaven Bricks`,
            userReceipt
          ).catch((e) => console.error('[Email error user service receipt]:', e));
        }

        const adminAlert = templates.paymentAlertAdmin(
          userName,
          userEmail || 'Not Provided',
          amount,
          paymentType,
          sessionId,
          `Service: ${serviceName}`
        );
        sendEmail(
          ADMIN_EMAIL,
          `[SERVICE PAYMENT] $${amount.toFixed(2)} NZD - ${serviceName}`,
          adminAlert
        ).catch((e) => console.error('[Email error admin service alert]:', e));

        console.log(`[Webhook] Recorded ${paymentType} of $${amount.toFixed(2)} NZD for user ${userId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
