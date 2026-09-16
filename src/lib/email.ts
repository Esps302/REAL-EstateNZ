import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"Heaven Bricks" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Service] Successfully sent to ' + to + ' | ID: ' + info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error('[Email Service Error]:', error);
    return { success: false, error };
  }
};

// ---------------------------------------------------------------------------
// ULTRA-LUXURY EMAIL TEMPLATE WRAPPER
// ---------------------------------------------------------------------------

const baseEmailTemplate = (content: string, preheaderText = "Heaven Bricks Real Estate Notification") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Heaven Bricks</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #18181b;
      background-color: #f4f4f5;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .preheader {
      display: none;
      font-size: 1px;
      color: #f4f4f5;
      line-height: 1px;
      max-height: 0px;
      max-width: 0px;
      opacity: 0;
      overflow: hidden;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      border: 1px solid #e4e4e7;
    }
    .header {
      background-color: #09090b;
      padding: 36px 40px 32px 40px;
      text-align: center;
      border-bottom: 2px solid #27272a;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .header p {
      color: #a1a1aa;
      margin: 6px 0 0 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
    }
    .content {
      padding: 40px;
    }
    .content h2 {
      color: #09090b;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .content p {
      font-size: 15px;
      color: #3f3f46;
      margin-bottom: 16px;
      line-height: 1.65;
    }
    .card {
      background-color: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .card-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f4f4f5;
      font-size: 14px;
    }
    .card-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .card-label {
      color: #71717a;
      font-weight: 500;
    }
    .card-value {
      color: #09090b;
      font-weight: 700;
      text-align: right;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-success {
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .badge-info {
      background-color: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
    .badge-gold {
      background-color: #fefce8;
      color: #854d0e;
      border: 1px solid #fef08a;
    }
    .amount-highlight {
      font-size: 30px;
      font-weight: 800;
      color: #09090b;
      margin: 12px 0 6px 0;
      letter-spacing: -0.5px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #09090b;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      margin-top: 20px;
      text-align: center;
    }
    .footer {
      background-color: #fafafa;
      padding: 28px 40px;
      text-align: center;
      border-top: 1px solid #e4e4e7;
    }
    .footer p {
      color: #71717a;
      font-size: 12px;
      line-height: 1.5;
      margin: 4px 0;
    }
    .footer a {
      color: #18181b;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="preheader">${preheaderText}</div>
  <div class="container">
    
    <div class="header">
      <h1>Heaven Bricks</h1>
      <p>Luxury Digital Brokerage &bull; New Zealand</p>
    </div>

    <div class="content">
      ${content}
    </div>

    <div class="footer">
      <p><strong>Heaven Bricks Limited</strong> &bull; 6 Emerald Avenue, Rosehill, Papakura, Auckland NZ 2113</p>
      <p>Phone: <a href="tel:+64210468503">+64 210468503</a> &bull; Email: <a href="mailto:Info@spsolutions.org.nz">Info@spsolutions.org.nz</a></p>
      <p style="margin-top: 12px; font-size: 11px; color: #a1a1aa;">
        This email and any attachments are confidential and intended solely for the recipient. All property transactions and valuations are conducted under strict confidentiality.
      </p>
    </div>

  </div>
</body>
</html>
`;

export const templates = {
  // 1. Payment Receipt (To User)
  paymentReceiptUser: (
    userName: string,
    amount: number,
    paymentTypeDescription: string,
    referenceId: string,
    itemDescription?: string
  ) => {
    const formattedAmount = `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NZD`;
    const dateStr = new Date().toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="badge badge-success">&#10003; Payment Confirmed</span>
        <div class="amount-highlight">${formattedAmount}</div>
        <p style="color: #71717a; font-size: 14px; margin: 0;">Official Receipt &bull; Heaven Bricks NZ</p>
      </div>

      <h2>Thank you for your payment, ${userName}</h2>
      <p>
        Your transaction has been processed securely via Stripe. Below is the itemized summary of your transaction:
      </p>

      <div class="card">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 10px 0; color: #71717a;">Payment Description</td>
            <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #09090b;">${paymentTypeDescription}</td>
          </tr>
          ${itemDescription ? `
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 10px 0; color: #71717a;">Details / Asset</td>
            <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #09090b;">${itemDescription}</td>
          </tr>` : ''}
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 10px 0; color: #71717a;">Transaction Date</td>
            <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #09090b;">${dateStr}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 10px 0; color: #71717a;">Payment Method</td>
            <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #09090b;">Credit / Debit Card (Stripe)</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #71717a;">Reference / Session ID</td>
            <td style="padding: 10px 0; font-family: monospace; font-size: 11px; text-align: right; color: #71717a;">${referenceId.slice(0, 24)}...</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 14px; color: #52525b;">
        Your updated account balance and transaction records are live in your digital dashboard.
      </p>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://heavenbrick.com'}/dashboard/wallet" class="button">
          View Wallet & Receipts &rarr;
        </a>
      </div>
    `;

    return baseEmailTemplate(content, `Payment Confirmation: ${formattedAmount} received`);
  },

  // 2. Payment Alert (To Admin)
  paymentAlertAdmin: (
    userName: string,
    userEmail: string,
    amount: number,
    paymentType: string,
    referenceId: string,
    details?: string
  ) => {
    const formattedAmount = `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NZD`;

    const content = `
      <div style="margin-bottom: 20px;">
        <span class="badge badge-gold">New Revenue Alert</span>
        <div class="amount-highlight" style="color: #059669;">+${formattedAmount}</div>
        <p style="color: #71717a; font-size: 13px; margin: 0;">Automated Brokerage Financial Alert</p>
      </div>

      <h2>New Payment Received on Platform</h2>
      <p>
        A new payment has just cleared through Stripe. Below are the details for your audit and CRM records:
      </p>

      <div class="card">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 8px 0; color: #71717a;">Customer Name</td>
            <td style="padding: 8px 0; font-weight: 700; text-align: right;">${userName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 8px 0; color: #71717a;">Customer Email</td>
            <td style="padding: 8px 0; font-weight: 600; text-align: right;"><a href="mailto:${userEmail}" style="color: #0073e6;">${userEmail}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 8px 0; color: #71717a;">Payment Type</td>
            <td style="padding: 8px 0; font-weight: 700; text-align: right; text-transform: capitalize;">${paymentType.replace(/_/g, ' ')}</td>
          </tr>
          ${details ? `
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 8px 0; color: #71717a;">Item / Reference</td>
            <td style="padding: 8px 0; font-weight: 600; text-align: right;">${details}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; color: #71717a;">Stripe Session</td>
            <td style="padding: 8px 0; font-family: monospace; font-size: 11px; text-align: right; color: #71717a;">${referenceId}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://heavenbrick.com'}/admin/economy" class="button">
          Open Admin Economy Console &rarr;
        </a>
      </div>
    `;

    return baseEmailTemplate(content, `[ADMIN REVENUE] ${formattedAmount} received from ${userName}`);
  },

  // 3. Welcome Confirmation (Client/User)
  welcomeConfirmation: (userName: string, role: string) => {
    let roleMessage = '';
    if (role === 'buyer') {
      roleMessage = 'As a registered buyer, you now have priority access to private viewings, confidential offers, and our Smart Match recommendation engine across New Zealand.';
    } else if (role === 'seller') {
      roleMessage = 'As a registered seller, you can now submit properties for discrete listing. All inquiries and negotiations are managed directly by our licensed managing brokers.';
    } else {
      roleMessage = 'Your client account is active. Explore our exclusive property portfolio and connect with our broker team anytime.';
    }

    const content = `
      <div style="margin-bottom: 20px;">
        <span class="badge badge-info">Welcome to Heaven Bricks</span>
      </div>

      <h2>Welcome, ${userName}!</h2>
      <p>
        Thank you for joining Heaven Bricks — New Zealand's premier digital real estate brokerage. Your account is verified and ready for use.
      </p>
      
      <div class="card" style="background-color: #f8fafc; border-color: #cbd5e1;">
        <strong style="color: #0f172a; display: block; margin-bottom: 6px; font-size: 15px;">
          The Heaven Bricks Confidentiality Guarantee
        </strong>
        <p style="color: #475569; margin: 0; font-size: 13.5px; line-height: 1.6;">
          We operate with strict confidentiality protocols. Buyer identity and seller reserve figures are kept strictly protected. Our licensed brokers negotiate on your behalf to secure the best market outcomes.
        </p>
      </div>

      <p>${roleMessage}</p>
      <p>If you require private assistance or an appraisal, our managing brokers are at your disposal.</p>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://heavenbrick.com'}/dashboard" class="button">
          Access Your Client Portal &rarr;
        </a>
      </div>
    `;
    return baseEmailTemplate(content, `Welcome to Heaven Bricks, ${userName}`);
  },

  // 4. Offer Submitted (To Buyer)
  offerSubmitted: (userName: string, propertyTitle: string, offerAmount: number) => {
    const formattedOffer = `$${offerAmount.toLocaleString()} NZD`;
    const content = `
      <div style="margin-bottom: 20px;">
        <span class="badge badge-success">Offer Submitted</span>
        <div class="amount-highlight">${formattedOffer}</div>
      </div>

      <h2>Your Confidential Offer Has Been Registered</h2>
      <p>Dear ${userName},</p>
      <p>
        We have formally registered your offer for <strong>${propertyTitle}</strong>.
      </p>

      <div class="card">
        <div class="card-row">
          <span class="card-label">Property</span>
          <span class="card-value">${propertyTitle}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Submitted Offer</span>
          <span class="card-value">${formattedOffer}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Status</span>
          <span class="card-value" style="color: #0284c7;">Under Broker Review</span>
        </div>
      </div>

      <p><strong>Next Steps:</strong></p>
      <p style="font-size: 14px; color: #52525b;">
        Our brokerage management team will evaluate your offer against the seller's confidential reserve conditions. Once evaluated, your assigned broker will notify you directly through your portal.
      </p>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://heavenbrick.com'}/dashboard" class="button">
          Track Offer Status &rarr;
        </a>
      </div>
    `;
    return baseEmailTemplate(content, `Offer Received for ${propertyTitle}`);
  },

  // 5. Agent Requested (To Admin)
  agentRequested: (name: string, email: string, phone: string, interest: string, region: string, requirements: string) => {
    const content = `
      <div style="margin-bottom: 20px;">
        <span class="badge badge-info">New Client Inquiry / Lead</span>
      </div>

      <h2>New Broker Consultation Request</h2>
      <p>A client has submitted a direct inquiry through Heaven Bricks:</p>

      <div class="card">
        <div class="card-row">
          <span class="card-label">Client Name</span>
          <span class="card-value">${name}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Email</span>
          <span class="card-value"><a href="mailto:${email}">${email}</a></span>
        </div>
        <div class="card-row">
          <span class="card-label">Phone</span>
          <span class="card-value"><a href="tel:${phone}">${phone}</a></span>
        </div>
        <div class="card-row">
          <span class="card-label">Interest</span>
          <span class="card-value">${interest}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Target Region</span>
          <span class="card-value">${region}</span>
        </div>
      </div>

      <div class="card" style="background-color: #f8fafc;">
        <strong style="display: block; margin-bottom: 6px; font-size: 13px; color: #64748b;">Client Message:</strong>
        <p style="margin: 0; font-size: 14px; color: #1e293b; white-space: pre-line;">${requirements || "No additional message provided."}</p>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://heavenbrick.com'}/admin/crm" class="button">
          Open In CRM &rarr;
        </a>
      </div>
    `;
    return baseEmailTemplate(content, `New Client Lead: ${name} (${interest})`);
  },

  // 6. Service Requested (To Admin)
  serviceRequested: (name: string, email: string, phone: string, serviceType: string, propertyAddress: string) => {
    const content = `
      <div style="margin-bottom: 20px;">
        <span class="badge badge-gold">Service Case Request</span>
      </div>

      <h2>New Property Service Request</h2>
      <p>A client has requested professional services through the portal:</p>

      <div class="card">
        <div class="card-row">
          <span class="card-label">Service Type</span>
          <span class="card-value" style="color: #0284c7;">${serviceType}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Client Name</span>
          <span class="card-value">${name}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Contact Email</span>
          <span class="card-value"><a href="mailto:${email}">${email}</a></span>
        </div>
        <div class="card-row">
          <span class="card-label">Phone</span>
          <span class="card-value">${phone}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Property</span>
          <span class="card-value">${propertyAddress}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://heavenbrick.com'}/admin/crm" class="button">
          Review in CRM &rarr;
        </a>
      </div>
    `;
    return baseEmailTemplate(content, `Service Request: ${serviceType} for ${name}`);
  },

  // 7. User Action Confirmation (Generic)
  userActionConfirmation: (
    userName: string,
    actionTitle: string,
    actionMessage: string,
    link?: string,
    actionDetails?: Record<string, string>
  ) => {
    let detailsHtml = '';
    if (actionDetails && Object.keys(actionDetails).length > 0) {
      detailsHtml = '<div class="card">';
      for (const [key, value] of Object.entries(actionDetails)) {
        detailsHtml += `
          <div class="card-row">
            <span class="card-label">${key}</span>
            <span class="card-value">${value}</span>
          </div>`;
      }
      detailsHtml += '</div>';
    }

    const content = `
      <div style="margin-bottom: 20px;">
        <span class="badge badge-info">Request Confirmation</span>
      </div>

      <h2>${actionTitle}</h2>
      <p>Dear ${userName},</p>
      <p>${actionMessage}</p>
      ${detailsHtml}
      ${link ? `
      <div style="text-align: center;">
        <a href="${link}" class="button">View Details &rarr;</a>
      </div>` : ''}
    `;
    return baseEmailTemplate(content, actionTitle);
  },

  // 8. Admin Notification to User (Updates)
  adminNotificationToUser: (
    userName: string,
    updateTitle: string,
    updateMessage: string,
    link?: string,
    status?: string
  ) => {
    let statusBadge = '';
    if (status) {
      const isPositive = ['approved', 'accepted', 'completed', 'confirmed'].includes(status.toLowerCase());
      statusBadge = `<span class="badge ${isPositive ? 'badge-success' : 'badge-gold'}">Status: ${status}</span>`;
    }

    const content = `
      ${statusBadge ? `<div style="margin-bottom: 16px;">${statusBadge}</div>` : ''}
      <h2>${updateTitle}</h2>
      <p>Dear ${userName},</p>
      <p>${updateMessage}</p>
      ${link ? `
      <div style="text-align: center;">
        <a href="${link}" class="button">View in Portal &rarr;</a>
      </div>` : ''}
    `;
    return baseEmailTemplate(content, updateTitle);
  }
};
