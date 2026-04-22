import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/super-admin/", "/onboarding/"],
    },
    sitemap: "https://otogent.com/sitemap.xml",
  };
}
