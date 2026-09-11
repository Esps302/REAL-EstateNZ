import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.heavenbrick.com";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/api/*",
          "/login",
          "/register",
          "/settings",
          "/edit-property",
          "/seed",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
