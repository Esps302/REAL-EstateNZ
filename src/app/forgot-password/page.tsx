"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSubmitted(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError(err.message || 'Failed to send password reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center pt-28 pb-16 sm:px-6 lg:px-8 font-sans relative z-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-md">
            <Mail className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Enter your account email and we will send you a secure link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div 
          className="bg-white py-10 px-6 sm:rounded-2xl sm:px-12 border border-zinc-200" 
          style={{ boxShadow: '0 4px 24px -6px rgba(0, 0, 0, 0.05)' }}
        >
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Check your inbox</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                We have sent instructions to reset your password to <strong className="text-zinc-900">{email}</strong>.
              </p>
              <p className="text-xs text-zinc-400">
                Did not receive the email? Check your spam folder or try again in a few minutes.
              </p>

              <div className="pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setEmail(''); }}
                  className="w-full py-3 px-4 border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Send another email
                </button>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-sm font-semibold text-zinc-900 mb-2">
                  Email address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 text-base text-zinc-900 bg-white border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="e.g. email@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending link...' : 'Send reset link'}
                </button>
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
