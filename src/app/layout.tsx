import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import RewardPopup from "@/components/RewardPopup";
import CreditNagPopup from "@/components/CreditNagPopup";
import SplashScreen from "@/components/SplashScreen";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit",
  display: "swap",
});

import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.heavenbrick.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Heaven Bricks | Premium Real Estate Brokerage",
    template: "%s | Heaven Bricks",
  },
  description: "Find your dream home in New Zealand with Heaven Bricks, the premium real estate platform.",
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: "https://www.heavenbrick.com",
    siteName: "Heaven Bricks",
    title: "Heaven Bricks | Premium Real Estate Brokerage",
    description: "Find your dream home in New Zealand with Heaven Bricks.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Heaven Bricks | Premium Real Estate Brokerage",
    description: "Find your dream home in New Zealand with Heaven Bricks.",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en">
  <body className={`${outfit.variable} antialiased min-h-screen flex flex-col`}>
 <AuthProvider>
 <div className="flex flex-col min-h-screen">
 <SplashScreen />
 <Navbar />
 <main className="flex-grow pb-16 md:pb-0">
 {children}
 </main>
 <Footer />
 <MobileBottomNav />
 </div>
 <Toaster richColors position="bottom-right" />
 <CreditNagPopup />
 <RewardPopup />
 </AuthProvider>
 </body>
 </html>
 );
}
