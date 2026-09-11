import { MetadataRoute } from "next";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.heavenbrick.com";

  // 1. Core High-Value Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sell`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/smart-match`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. Dynamic approved property listings
  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const q = query(
      collection(db, "properties"),
      where("status", "==", "approved"),
      limit(250)
    );
    const snapshot = await getDocs(q);
    propertyRoutes = snapshot.docs.map((doc) => {
      const data = doc.data();
      let lastModified = new Date();
      if (data.updatedAt) {
        lastModified = typeof data.updatedAt.toDate === "function" 
          ? data.updatedAt.toDate() 
          : new Date(data.updatedAt);
      } else if (data.createdAt) {
        lastModified = typeof data.createdAt.toDate === "function" 
          ? data.createdAt.toDate() 
          : new Date(data.createdAt);
      }

      return {
        url: `${baseUrl}/property/${doc.id}`,
        lastModified,
        changeFrequency: "daily" as const,
        priority: 0.8,
      };
    });
  } catch (error) {
    console.error("Error fetching properties for sitemap:", error);
  }

  return [...staticRoutes, ...propertyRoutes];
}
