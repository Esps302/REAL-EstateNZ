import { auth } from '@/lib/firebase';

export async function sendNotificationEmail(params: {
  to?: string;
  userId?: string;
  templateType: 'userActionConfirmation' | 'adminNotificationToUser' | string;
  payload: any;
}) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const currentUser = auth.currentUser;
    if (currentUser) {
      const idToken = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    const res = await fetch('/api/email', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      console.error('Failed to send notification email:', await res.text());
    }
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
}
