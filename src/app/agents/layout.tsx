import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Real Estate Agents in Auckland & New Zealand | Heaven Bricks",
  description: "Connect with the highest-rated licensed real estate agents in New Zealand. Top performers in Auckland, Wellington, Queenstown, and Christchurch ready to help you buy or sell.",
  keywords: [
    "real estate agents New Zealand",
    "best real estate agents Auckland",
    "top property brokers NZ",
    "Queenstown real estate agents",
    "Wellington real estate agents",
    "Christchurch property specialists",
    "find an agent NZ",
    "luxury home specialists New Zealand",
  ],
  alternates: {
    canonical: "/agents",
  },
  openGraph: {
    title: "Top Real Estate Agents in New Zealand | Heaven Bricks",
    description: "Connect with top-rated licensed property agents across New Zealand.",
    url: "https://www.heavenbrick.com/agents",
  },
};

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
