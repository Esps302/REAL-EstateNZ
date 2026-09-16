import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SUBURBS_DATA, SuburbInfo } from "@/lib/suburbData";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Property } from "@/types";
import PropertyCard from "@/components/PropertyCard";
import FAQAccordion from "@/components/FAQAccordion";
import { 
  MapPin, 
  GraduationCap, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  Search 
} from "lucide-react";

interface Props {
  params: { slug: string };
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const suburb = SUBURBS_DATA[params.slug];
  if (!suburb) {
    return { title: "Location Not Found | Heaven Bricks" };
  }

  const rawBase = process.env.NEXT_PUBLIC_SITE_URL || "https://www.heavenbrick.com";
  const baseUrl = rawBase.replace(/\/+$/, "");

  return {
    title: suburb.metaTitle,
    description: suburb.metaDescription,
    keywords: suburb.keywords,
    alternates: {
      canonical: `${baseUrl}/locations/${suburb.slug}`,
    },
    openGraph: {
      title: suburb.metaTitle,
      description: suburb.metaDescription,
      url: `${baseUrl}/locations/${suburb.slug}`,
      type: "website",
      images: [
        {
          url: suburb.heroImage,
          width: 1200,
          height: 630,
          alt: `${suburb.name} Real Estate New Zealand`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: suburb.metaTitle,
      description: suburb.metaDescription,
      images: [suburb.heroImage],
    },
  };
}

// 2. Pre-generate all suburb routes for blazing fast static delivery
export function generateStaticParams() {
  return Object.keys(SUBURBS_DATA).map((slug) => ({ slug }));
}

// 3. Page Component
export default async function SuburbPage({ params }: Props) {
  const suburb = SUBURBS_DATA[params.slug];
  if (!suburb) {
    notFound();
  }

  // Fetch approved properties from Firestore matching this suburb or region
  let properties: Property[] = [];
  try {
    const q = query(
      collection(db, "properties"),
      where("status", "==", "approved"),
      limit(24)
    );
    const snap = await getDocs(q);
    const allProps = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Property));

    // Filter matching suburb, city, or district
    const lowerName = suburb.name.toLowerCase();
    const lowerRegion = suburb.region.toLowerCase();
    const matches = allProps.filter((p) => {
      const pSub = (p.suburb || "").toLowerCase();
      const pCity = (p.city || "").toLowerCase();
      const pAddr = (p.address || "").toLowerCase();
      return (
        lowerName.includes(pSub) ||
        pSub.includes("papakura") && suburb.slug === "papakura" ||
        lowerName.includes(pCity) ||
        pAddr.includes(lowerName) ||
        lowerRegion.includes(pCity)
      );
    });

    if (matches.length > 0) {
      properties = matches.slice(0, 6);
    } else {
      // Graceful fallback to latest approved luxury properties
      properties = allProps.slice(0, 3);
    }
  } catch (err) {
    console.error("Failed to fetch location properties:", err);
  }

  // Schema: FAQPage Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": suburb.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  // Schema: BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.heavenbrick.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Locations",
        "item": "https://www.heavenbrick.com/search",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": suburb.name,
        "item": `https://www.heavenbrick.com/locations/${suburb.slug}`,
      },
    ],
  };

  return (
    <>
      {/* Inject Google SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-zinc-50 font-sans pt-24 md:pt-28 pb-20">
        
        {/* Suburb Hero Banner */}
        <section className="relative bg-zinc-950 text-white overflow-hidden py-16 md:py-24 border-b border-zinc-800">
          <div className="absolute inset-0 z-0 opacity-25">
            <Image
              src={suburb.heroImage}
              alt={`${suburb.name} Real Estate`}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest mb-4 border border-white/20">
                <MapPin className="w-3.5 h-3.5 text-[#0073e6]" />
                {suburb.region} &bull; {suburb.district}
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                Properties in {suburb.name}
              </h1>

              <p className="text-lg md:text-xl text-zinc-300 font-light mb-8 leading-relaxed">
                {suburb.headline}
              </p>

              {/* Key Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Median Price
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white">{suburb.medianPrice}</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    Average Rent
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white">{suburb.averageRentWeekly}</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 col-span-2 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Commute & Transit
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-white truncate">{suburb.commute}</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
          
          {/* Active Listings in this Suburb */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#0073e6] bg-blue-50 px-3 py-1 rounded-full">
                  Available Homes
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 mt-2">
                  Featured Properties in {suburb.name}
                </h2>
              </div>
              <Link
                href={`/search?query=${encodeURIComponent(suburb.name.split(' ')[0])}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0073e6] hover:underline"
              >
                <span>View All Properties in {suburb.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-10 rounded-3xl border border-zinc-200 text-center">
                <Building2 className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-zinc-900 mb-1">New listings arriving soon</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto mb-4">
                  We are currently verifying off-market properties in {suburb.name}. Contact our managing brokers for confidential private opportunities.
                </p>
                <Link
                  href="/contact"
                  className="inline-block px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
                >
                  Request Off-Market Listings
                </Link>
              </div>
            )}
          </section>

          {/* Suburb Profile & Highlights */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Lifestyle Overview */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 md:p-10 border border-zinc-200 shadow-sm space-y-6">
              <h3 className="text-2xl font-bold text-zinc-900">
                Living in {suburb.name}
              </h3>
              <p className="text-base text-zinc-600 leading-relaxed">
                {suburb.lifestyleText}
              </p>

              <div className="pt-4 border-t border-zinc-100">
                <h4 className="font-bold text-zinc-900 text-base mb-3">Key Suburb Highlights:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suburb.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-zinc-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* School Zones Card */}
              <div className="pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-[#0073e6]" />
                  <h4 className="font-bold text-zinc-900 text-base">Top Local School Zones:</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suburb.schools.map((school, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-lg"
                    >
                      {school}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Free Appraisal CTA Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 mb-6">
                <Building2 className="w-6 h-6" />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Homeowners in {suburb.name}
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1 mb-3">
                Thinking of selling in {suburb.name}?
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                Get an accurate, confidential property appraisal based on recent verified sales and active buyer demand in {suburb.district}.
              </p>

              <div className="space-y-3 mb-8 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Confidential & No Obligation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Direct Consultation with Licensed Auckland Managing Brokers</span>
                </div>
              </div>

              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-white hover:bg-zinc-100 text-zinc-900 font-bold rounded-xl text-sm transition-all shadow-md"
              >
                <span>Request Free Appraisal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </section>

          {/* Suburb FAQ Section (Rich Snippet Ready) */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border border-zinc-200 shadow-sm">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0073e6] bg-blue-50 px-3 py-1 rounded-full">
                Frequently Asked Questions
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-zinc-900 mt-3 mb-2">
                Questions About Buying in {suburb.name}
              </h3>
              <p className="text-sm text-zinc-500">
                Answers to common buyer and investor questions verified by licensed New Zealand real estate specialists.
              </p>
            </div>

            <FAQAccordion faqs={suburb.faqs} />
          </section>

          {/* Explore Other Suburbs */}
          <section className="pt-6">
            <h3 className="text-xl font-bold text-zinc-900 mb-6">
              Explore More Popular New Zealand Locations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.values(SUBURBS_DATA)
                .filter((s) => s.slug !== suburb.slug)
                .map((other) => (
                  <Link
                    key={other.slug}
                    href={`/locations/${other.slug}`}
                    className="p-4 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-900 hover:shadow-sm transition-all group"
                  >
                    <div className="font-bold text-zinc-900 text-sm group-hover:text-[#0073e6] transition-colors">
                      {other.name}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">{other.region}</div>
                  </Link>
                ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
