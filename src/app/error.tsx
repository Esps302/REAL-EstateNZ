"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled client application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4 pt-28 pb-20 font-sans relative z-10 text-center">
      <div className="max-w-md mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
          Something went wrong
        </span>

        <h2 className="text-2xl font-extrabold text-zinc-900 mt-4 mb-2 tracking-tight">
          Application Notice
        </h2>

        <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
          We encountered an unexpected problem while loading this page. You can try refreshing the component or returning to the home page.
        </p>

        {error?.digest && (
          <p className="text-[11px] font-mono text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-lg mb-6 truncate max-w-xs mx-auto">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-bold border border-zinc-200 shadow-sm transition-all"
          >
            <Home className="w-4 h-4 text-zinc-500" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
