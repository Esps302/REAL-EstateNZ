import { Metadata } from "next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://www.heavenbrick.com";

  try {
    const docRef = doc(db, "properties", params.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const title = `${data.title} | Heaven Bricks NZ`;
      const description = `${data.bedrooms || ""} Bed, ${data.bathrooms || ""} Bath ${
        data.type || "Property"
      } in ${data.suburb || data.city || "New Zealand"}. Price: $${Number(
        data.price || 0
      ).toLocaleString()} NZD. ${data.description?.slice(0, 140) || ""}...`;
      const imageUrl = data.images?.[0] || "/images/logo-2.png";

      return {
        title,
        description,
        alternates: {
          canonical: `/property/${params.id}`,
        },
        openGraph: {
          title,
          description,
          url: `${baseUrl}/property/${params.id}`,
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: data.title || "Property Image",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [imageUrl],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata for property:", error);
  }

  return {
    title: "Luxury Property in New Zealand | Heaven Bricks",
    description:
      "Explore verified luxury properties and homes for sale in New Zealand with Heaven Bricks.",
  };
}

export default async function PropertyDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  let jsonLd = null;
  try {
    const docRef = doc(db, "properties", params.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const p = docSnap.data();
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "SingleFamilyResidence",
        name: p.title,
        description: p.description,
        numberOfRooms: p.bedrooms,
        numberOfBathroomsTotal: p.bathrooms,
        floorSize: {
          "@type": "QuantitativeValue",
          value: p.area || p.sqft,
          unitCode: "MTK",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: p.city || "Auckland",
          addressRegion: p.region || p.city,
          addressCountry: "NZ",
        },
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "NZD",
          availability: "https://schema.org/InStock",
        },
      };
    }
  } catch {
    // Graceful fallback
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
