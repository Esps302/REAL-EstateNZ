import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your saved properties, submitted offers, and account settings on Heaven Bricks.",
  alternates: {
    canonical: "/dashboard",
  },
  openGraph: {
    title: "Dashboard | Heaven Bricks",
    description: "Manage your saved properties, submitted offers, and account settings.",
    url: "https://www.heavenbrick.com/dashboard",
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
