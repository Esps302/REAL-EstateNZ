import { NextResponse } from 'next/server';
import { sendEmail, templates } from '@/lib/email';

export async function POST(request: Request) {
  try {
    // 1. Verify simple API Secret (works for both guests and logged-in users)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.NEXT_PUBLIC_API_SECRET || 'dev-secret-key';
    
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized: Invalid API key' }, { status: 401 });
    }

    const body = await request.json();
    let { to, userId, templateType, payload } = body;

    // Server-Side Email Lookup if 'to' is missing but 'userId' is provided
    if (!to && userId) {
      try {
        const { adminDb } = await import('@/lib/firebase-admin');
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          to = userData?.email;
          if (!payload.userName) {
            payload.userName = userData?.name || 'Valued Client';
          }
        }
      } catch (err) {
        console.error("Failed to fetch user from adminDb for email lookup", err);
      }
    }

    if (!to || !templateType || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields (to, templateType, payload)' },
        { status: 400 }
      );
    }

    let subject = '';
    let htmlContent = '';

    // Route to the correct template
    switch (templateType) {
      case 'welcomeConfirmation':
        subject = 'Welcome to Premium Real Estate Brokerage';
        htmlContent = templates.welcomeConfirmation(payload.userName, payload.role);
        break;
      case 'offerSubmitted':
        subject = 'Offer Successfully Submitted - Premium Brokerage';
        htmlContent = templates.offerSubmitted(payload.userName, payload.propertyTitle, payload.offerAmount);
        break;
      case 'agentRequested':
        subject = 'New Agent Request - Lead Generated';
        htmlContent = templates.agentRequested(payload.name, payload.email, payload.phone, payload.interest, payload.region, payload.requirements);
        break;
      case 'serviceRequested':
        subject = 'New Service Request - Premium Brokerage';
        htmlContent = templates.serviceRequested(payload.name, payload.email, payload.phone, payload.serviceType, payload.propertyAddress);
        break;
      case 'userActionConfirmation':
        subject = payload.title || 'Request Received - Premium Brokerage';
        htmlContent = templates.userActionConfirmation(
          payload.userName, 
          payload.actionTitle, 
          payload.actionMessage, 
          payload.link,
          payload.actionDetails
        );
        break;
      case 'adminNotificationToUser':
        subject = payload.title || 'Important Update - Premium Brokerage';
        htmlContent = templates.adminNotificationToUser(
          payload.userName, 
          payload.updateTitle, 
          payload.updateMessage, 
          payload.link,
          payload.status
        );
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid template type' },
          { status: 400 }
        );
    }

    // Send the email
    const result = await sendEmail(to, subject, htmlContent);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      console.error('Email sending failed:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API /email error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
