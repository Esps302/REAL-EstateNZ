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
 from: `"Premium Real Estate Brokerage" <${process.env.SMTP_EMAIL}>`,
 to,
 subject,
 html,
 };

 try {
 const info = await transporter.sendMail(mailOptions);
 console.log('Email sent: ' + info.response);
 return { success: true, info };
 } catch (error) {
 console.error('Error sending email:', error);
 return { success: false, error };
 }
};

// ---------------------------------------------------------------------------
// PROFESSIONAL EMAIL TEMPLATES
// ---------------------------------------------------------------------------

const baseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <style>
 body {
 font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
 line-height: 1.6;
 color: #18181b;
 background-color: #f4f4f5;
 margin: 0;
 padding: 0;
 }
 .container {
 max-width: 600px;
 margin: 40px auto;
 background-color: #ffffff;
 border-radius: 16px;
 overflow: hidden;
 box-shadow: 0 4px 20px rgba(0,0,0,0.05);
 border: 1px solid #e4e4e7;
 }
 .header {
 background-color: #09090b;
 padding: 32px 40px;
 text-align: center;
 }
 .header h1 {
 color: #ffffff;
 margin: 0;
 font-size: 24px;
 font-weight: 800;
 letter-spacing: -0.5px;
 }
 .header p {
 color: #a1a1aa;
 margin: 8px 0 0 0;
 font-size: 14px;
 text-transform: uppercase;
 letter-spacing: 1px;
 }
 .content {
 padding: 40px;
 }
 .content h2 {
 color: #09090b;
 font-size: 20px;
 margin-top: 0;
 }
 .footer {
 background-color: #fafafa;
 padding: 24px 40px;
 text-align: center;
 border-top: 1px solid #e4e4e7;
 }
 .footer p {
 color: #71717a;
 font-size: 12px;
 margin: 0;
 }
 .button {
 display: inline-block;
 padding: 14px 28px;
 background-color: #09090b;
 color: #ffffff !important;
 text-decoration: none;
 border-radius: 8px;
 font-weight: 600;
 font-size: 14px;
 margin-top: 24px;
 }
 .highlight-box {
 background-color: #f0fdf4;
 border: 1px solid #bbf7d0;
 padding: 20px;
 border-radius: 8px;
 margin: 24px 0;
 }
 .highlight-box.blue {
 background-color: #eff6ff;
 border: 1px solid #bfdbfe;
 }
 </style>
</head>
<body>
 <div class="container">
 <div class="header">
 <h1>Premium Brokerage</h1>
 <p>Exclusive Real Estate Services</p>
 </div>
 <div class="content">
 ${content}
 </div>
 <div class="footer">
 <p>&copy; ${new Date().getFullYear()} Premium Real Estate Brokerage. All rights reserved.</p>
 <p>This email was sent securely via our platform.</p>
 </div>
 </div>
</body>
</html>
`;

export const templates = {
 // 1. Welcome Confirmation (Client/User)
 welcomeConfirmation: (userName: string, role: string) => {
 let roleMessage = '';
 if (role === 'buyer') {
 roleMessage = 'As a registered buyer, you now have access to submit offers, request viewings, and utilize our intelligent matching system to find your perfect property.';
 } else if (role === 'seller') {
 roleMessage = 'As a registered seller, you can now list your properties with our exclusive brokerage. Your privacy is guaranteed—we negotiate directly on your behalf without exposing your details.';
 }

 const content = `
 <h2>Welcome to the Platform, ${userName}!</h2>
 <p>Thank you for registering with our Premium Real Estate Brokerage. Your account has been successfully verified.</p>
 
 <div class="highlight-box blue">
 <strong style="color: #1e3a8a; display: block; margin-bottom: 8px;">Your Privacy is Our Priority</strong>
 <p style="color: #1e40af; margin: 0; font-size: 14px;">We operate a zero-direct-contact policy. Buyers and sellers are fully protected and never communicate directly. All negotiations, mortgage assistance, and legal processes are securely managed by our expert administration team.</p>
 </div>

 <p>${roleMessage}</p>
 <p>If you have any questions or require immediate assistance with a property, our support team is standing by.</p>
 
 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">Access Your Dashboard</a>
 `;
 return baseEmailTemplate(content);
 },

 // 2. Offer Submitted (To Buyer)
 offerSubmitted: (userName: string, propertyTitle: string, offerAmount: number) => {
 const content = `
 <h2>Your Offer Has Been Submitted</h2>
 <p>Dear ${userName},</p>
 <p>We have successfully received your official offer for <strong>${propertyTitle}</strong>.</p>
 
 <div class="highlight-box">
 <strong style="color: #166534; display: block; margin-bottom: 8px;">Offer Details</strong>
 <p style="color: #15803d; margin: 0; font-size: 16px; font-weight: bold;">Maximum Willing To Pay: $${offerAmount.toLocaleString()}</p>
 </div>

 <p>Our intelligent matching engine has logged your offer. Our brokerage team will now review this against the seller's confidential reserve expectations.</p>
 <p><strong>What happens next?</strong><br>
 You will be notified as soon as the seller reviews the offer. If the offer is accepted, our platform will seamlessly guide you through the next steps, including mortgage assistance and assigning a solicitor.</p>
 `;
 return baseEmailTemplate(content);
 },

 // 3. Agent Requested (To Admin)
 agentRequested: (name: string, email: string, phone: string, interest: string, region: string, requirements: string) => {
 const content = `
 <h2>New Agent Request Received</h2>
 <p>A new lead has requested to connect with an agent.</p>
 
 <div class="highlight-box blue">
 <strong style="color: #1e3a8a; display: block; margin-bottom: 8px;">Lead Details</strong>
 <p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Name:</strong> ${name}</p>
 <p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
 <p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>
 <p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Interest:</strong> Looking to ${interest}</p>
 <p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Region:</strong> ${region}</p>
 </div>

 <p><strong>Requirements:</strong><br>${requirements || "None provided"}</p>
 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/crm" class="button">View in CRM</a>
 `;
 return baseEmailTemplate(content);
 },

 // 4. Service Requested (To Admin)
 serviceRequested: (name: string, email: string, phone: string, serviceType: string, propertyAddress: string) => {
 const content = `
 <h2>New Service Request</h2>
 <p>A client has requested a property service.</p>
 
 <div class="highlight-box blue">
 <strong style="color: #1e3a8a; display: block; margin-bottom: 8px;">Request Details</strong>
 <p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Service:</strong> ${serviceType}</p>
 <p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Name:</strong> ${name}</p>
 <p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
 <p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>
 <p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Property:</strong> ${propertyAddress}</p>
 </div>
 
 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/crm" class="button">View in CRM</a>
 `;
 return baseEmailTemplate(content);
 },

 // 5. User Action Confirmation
 userActionConfirmation: (userName: string, actionTitle: string, actionMessage: string, link?: string, actionDetails?: Record<string, string>) => {
 let detailsHtml = '';
 if (actionDetails && Object.keys(actionDetails).length > 0) {
 detailsHtml = '<div class="highlight-box"><strong style="color: #166534; display: block; margin-bottom: 8px;">Details</strong>';
 for (const [key, value] of Object.entries(actionDetails)) {
 detailsHtml += `<p style="color: #15803d; margin: 0; font-size: 14px;"><strong>${key}:</strong> ${value}</p>`;
 }
 detailsHtml += '</div>';
 }

 const leadGen = `
 <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
 <h3 style="margin-top: 0; font-size: 16px; color: #09090b;">Take the Next Step with Premium Brokerage</h3>
 <p style="font-size: 14px; color: #52525b;">Did you know we offer exclusive, off-market properties and priority mortgage pre-approval? Connect with our expert advisors today to get ahead in the market.</p>
 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/agents" style="color: #4f46e5; font-weight: 600; text-decoration: none; font-size: 14px;">Connect with an Expert Agent &rarr;</a>
 </div>
 `;

 const content = `
 <h2>${actionTitle}</h2>
 <p>Dear ${userName},</p>
 <p>${actionMessage}</p>
 ${detailsHtml}
 ${link ? `<a href="${link}" class="button">View Request Details</a>` : ''}
 ${leadGen}
 `;
 return baseEmailTemplate(content);
 },

 // 6. Admin Notification to User (Updates)
 adminNotificationToUser: (userName: string, updateTitle: string, updateMessage: string, link?: string, status?: string) => {
 let statusHtml = '';
 if (status) {
 const isPositive = status.toLowerCase() === 'approved' || status.toLowerCase() === 'accepted' || status.toLowerCase() === 'success';
 const color = isPositive ? '#166534' : '#991b1b';
 const bgColor = isPositive ? '#f0fdf4' : '#fef2f2';
 const borderColor = isPositive ? '#bbf7d0' : '#fecaca';
 statusHtml = `
 <div style="background-color: ${bgColor}; border: 1px solid ${borderColor}; padding: 12px 20px; border-radius: 8px; margin: 20px 0; display: inline-block;">
 <strong style="color: ${color}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Status: ${status}</strong>
 </div>
 `;
 }

 const leadGen = `
 <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
 <h3 style="margin-top: 0; font-size: 16px; color: #09090b;">Looking for More?</h3>
 <p style="font-size: 14px; color: #52525b;">Whether you're buying, selling, or just exploring, our Premium Brokerage provides unmatched insights and access to top-tier real estate opportunities.</p>
 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search" style="color: #4f46e5; font-weight: 600; text-decoration: none; font-size: 14px;">Explore Premium Properties &rarr;</a>
 </div>
 `;

 const content = `
 <h2>${updateTitle}</h2>
 <p>Dear ${userName},</p>
 ${statusHtml}
 <p>${updateMessage}</p>
 ${link ? `<a href="${link}" class="button">View Update Details</a>` : ''}
 ${leadGen}
 `;
 return baseEmailTemplate(content);
 }
};
