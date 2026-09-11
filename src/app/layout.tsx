import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Lazy-load non-critical popups so they don't block initial page load / TBT
const CreditNagPopup = dynamic(() => import("@/components/CreditNagPopup"), { ssr: false });
const RewardPopup = dynamic(() => import("@/components/RewardPopup"), { ssr: false });

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.heavenbrick.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Heaven Bricks | Premium Real Estate Brokerage",
    template: "%s | Heaven Bricks",
  },
  description: "Find your dream luxury home in New Zealand with Heaven Bricks, the trusted digital real estate platform.",
  keywords: [
    "Heaven Bricks",
    "Real Estate New Zealand",
    "NZ property for sale",
    "luxury homes Auckland",
    "Wellington real estate",
    "Queenstown luxury estates",
    "Christchurch property",
    "buy house NZ",
  ],
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: "https://www.heavenbrick.com",
    siteName: "Heaven Bricks",
    title: "Heaven Bricks | Premium Real Estate Brokerage",
    description: "Find your dream luxury home in New Zealand with Heaven Bricks.",
    images: [
      {
        url: "/images/logo-2.png",
        width: 1200,
        height: 630,
        alt: "Heaven Bricks Real Estate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Heaven Bricks | Premium Real Estate Brokerage",
    description: "Find your dream luxury home in New Zealand with Heaven Bricks.",
    images: ["/images/logo-2.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#000000",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": "https://www.heavenbrick.com/#organization",
      "name": "Heaven Bricks",
      "url": "https://www.heavenbrick.com",
      "logo": "https://www.heavenbrick.com/images/logo-2.png",
      "description": "Discover New Zealand's most exclusive properties with Heaven Bricks, the trusted digital real estate brokerage.",
      "areaServed": {
        "@type": "Country",
        "name": "New Zealand",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.heavenbrick.com/#website",
      "url": "https://www.heavenbrick.com",
      "name": "Heaven Bricks",
      "publisher": {
        "@id": "https://www.heavenbrick.com/#organization",
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.heavenbrick.com/search?query={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.variable} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
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
