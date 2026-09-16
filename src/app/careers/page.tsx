import { Metadata } from "next";
import CareersContent from "@/components/CareersContent";

export const metadata: Metadata = {
  title: "Careers at Heaven Bricks | Real Estate Jobs New Zealand",
  description: "Join New Zealand's premier digital real estate brokerage. Explore careers in luxury property sales, software engineering, and architectural marketing.",
  keywords: [
    "real estate careers New Zealand",
    "real estate broker jobs Auckland",
    "luxury property sales careers NZ",
    "tech real estate jobs Auckland"
  ],
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersPage() {
  return <CareersContent />;
}
