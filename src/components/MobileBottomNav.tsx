"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, Wallet, PlusCircle } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/context/AuthContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { favorites } = useFavorites();
  const { user } = useAuth();

  // Hide mobile bottom nav in admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
      isActive: pathname.startsWith("/search"),
    },
    {
      name: "Sell",
      href: "/sell",
      icon: PlusCircle,
      isActive: pathname === "/sell",
      isSpecial: true,
    },
    {
      name: "Saved",
      href: "/saved",
      icon: Heart,
      isActive: pathname === "/saved",
      badgeCount: favorites.length > 0 ? favorites.length : undefined,
    },
    {
      name: "Wallet",
      href: user ? "/dashboard/wallet" : "/login",
      icon: Wallet,
      isActive: pathname.startsWith("/dashboard/wallet") || (pathname === "/login" && !user),
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-zinc-200/80 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] px-2 py-1.5 pb-safe"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          if (item.isSpecial) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-95 ${
                  active 
                    ? "bg-[var(--color-primary-dark)] text-white ring-4 ring-[var(--color-accent)]/30" 
                    : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-tight ${
                  active ? "text-[var(--color-primary)]" : "text-zinc-500 group-hover:text-zinc-800"
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 active:scale-95 relative group ${
                active ? "text-[var(--color-primary)] font-bold" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"}`} />
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-accent)] text-[10px] font-black text-black flex items-center justify-center shadow-sm">
                    {item.badgeCount > 9 ? "9+" : item.badgeCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${active ? "text-[var(--color-primary)] font-bold" : "text-zinc-500"}`}>
                {item.name}
              </span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-0.5"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
