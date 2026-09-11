import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Luxury Homes & Properties for Sale in New Zealand",
  description: "Browse verified residential and luxury commercial properties across Auckland, Wellington, Queenstown, and Christchurch. Filter by price, bedrooms, and location.",
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "Search Properties in New Zealand | Heaven Bricks",
    description: "Browse verified residential and luxury commercial properties across New Zealand.",
    url: "https://www.heavenbrick.com/search",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
