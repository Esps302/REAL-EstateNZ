import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Your House in New Zealand | Free Property Appraisal | Heaven Bricks",
  description: "Sell your home faster with Heaven Bricks. Get a free confidential property appraisal, connect with top-performing NZ agents, and reach qualified buyers across Auckland, Wellington, and Queenstown.",
  keywords: [
    "sell house New Zealand",
    "sell property NZ",
    "free property appraisal Auckland",
    "home valuation New Zealand",
    "list my house NZ",
    "real estate agents for sellers",
    "sell luxury home Auckland",
    "sell property Queenstown",
    "low commission real estate NZ",
  ],
  alternates: {
    canonical: "/sell",
  },
  openGraph: {
    title: "Sell Your House in New Zealand | Heaven Bricks",
    description: "Get a confidential market valuation and connect with verified buyers across New Zealand.",
    url: "https://www.heavenbrick.com/sell",
  },
};

export default function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
