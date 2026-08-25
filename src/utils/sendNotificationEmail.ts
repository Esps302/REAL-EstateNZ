export async function sendNotificationEmail(params: {
  to?: string;
  userId?: string;
  templateType: 'userActionConfirmation' | 'adminNotificationToUser' | string;
  payload: any;
}) {
  try {
    const res = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_SECRET || 'dev-secret-key'}`
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      console.error('Failed to send notification email:', await res.text());
    }
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
}
