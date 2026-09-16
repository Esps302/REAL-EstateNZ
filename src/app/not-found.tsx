import Link from "next/link";
import { Home, Search, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4 pt-28 pb-20 font-sans relative z-10 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-zinc-900 text-white flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Compass className="w-10 h-10 animate-pulse text-[#0073e6]" />
        </div>

        <span className="text-xs font-extrabold uppercase tracking-widest text-[#0073e6] bg-blue-50 px-3 py-1 rounded-full">
          404 &bull; Page Not Found
        </span>

        <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mt-4 mb-3 tracking-tight">
          Property or Page Not Found
        </h1>

        <p className="text-sm md:text-base text-zinc-600 mb-8 leading-relaxed">
          The listing or page you are looking for may have been archived, sold, or moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/search?type=buy"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-bold border border-zinc-200 shadow-sm transition-all"
          >
            <Search className="w-4 h-4 text-zinc-500" />
            <span>Browse Properties</span>
          </Link>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200">
          <p className="text-xs text-zinc-500">
            Need urgent broker assistance? Call us directly at{" "}
            <a href="tel:+64210468503" className="text-zinc-900 font-semibold hover:underline">
              +64 210468503
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
