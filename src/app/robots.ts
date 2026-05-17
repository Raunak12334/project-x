import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/super-admin/",
          "/onboarding/",
        ],
      },
    ],
    sitemap: "https://www.otogent.com/sitemap.xml",
    host: "https://www.otogent.com",
  };
}