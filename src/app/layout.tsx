import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import RewardPopup from "@/components/RewardPopup";
import CreditNagPopup from "@/components/CreditNagPopup";
import SplashScreen from "@/components/SplashScreen";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Heaven Bricks | Premium Real Estate",
  description: "Find your dream home in New Zealand with Heaven Bricks, the premium real estate platform.",
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
 <main className="flex-grow">
 {children}
 </main>
 <Footer />
 </div>
 <Toaster richColors position="bottom-right" />
 <CreditNagPopup />
 <RewardPopup />
 </AuthProvider>
 </body>
 </html>
 );
}
