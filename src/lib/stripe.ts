import Stripe from 'stripe';

if (typeof window !== 'undefined') {
  throw new Error('STRIPE_SECRET_KEY and Stripe server instance must never be accessed on the client-side.');
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not configured in server environment variables.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
  appInfo: {
    name: 'HeavenBrickNZ',
    version: '1.0.0',
  },
});
