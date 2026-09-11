import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Property Smart Match | Find Ideal Homes in New Zealand | Heaven Bricks",
  description: "Experience AI-powered property matching. Tell us your lifestyle, budget, school zones, and dream home wishlist to instantly get matched with homes across New Zealand.",
  keywords: [
    "AI property search New Zealand",
    "smart home matchmaker NZ",
    "find dream home Auckland",
    "property recommendation engine",
    "lifestyle home search NZ",
    "school zone property finder New Zealand",
  ],
  alternates: {
    canonical: "/smart-match",
  },
  openGraph: {
    title: "AI Property Smart Match | Heaven Bricks",
    description: "Discover homes tailored to your lifestyle and budget across New Zealand.",
    url: "https://www.heavenbrick.com/smart-match",
  },
};

export default function SmartMatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
