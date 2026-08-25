"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-50/80 backdrop-blur-md">
      <div className="relative w-64 h-24 mb-6">
        <Image 
          src="/images/logo-2.png" 
          alt="Heaven Bricks Loading" 
          fill 
          className="object-contain animate-pulse"
          priority
        />
      </div>
      <div className="flex items-center gap-3 text-[var(--color-primary)] font-bold uppercase tracking-widest text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading...
      </div>
    </div>
  );
}
