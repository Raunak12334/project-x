import type { MetadataRoute } from "next";
import { isMissingBlogTableError } from "@/features/blog/db";
import { workflowTemplates } from "@/features/templates/lib/workflow-templates";
import prisma from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Synchronized with metadataBase configuration in root layout
  const baseUrl = "https://otogent.com";
  const staticBuildDate = new Date("2026-05-22");

  const posts = await prisma.blogPost
    .findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        publishedAt: { not: null },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { publishedAt: "desc" },
    })
    .catch((error) => {
      if (isMissingBlogTableError(error)) {
        return [];
      }
      throw error;
    });

  const staticRoutes = [
    { url: `${baseUrl}`, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${baseUrl}/pricing`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/features`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/about`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/docs`, priority: 0.8, changeFrequency: "weekly" as const },

    // Explicit Sitelink Acceleration Routes
    { url: `${baseUrl}/login`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/signup`, priority: 0.8, changeFrequency: "monthly" as const },

    // Topical Authority Hubs
    { url: `${baseUrl}/multi-agent-automation`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/agentic-workflows`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/ai-workflow-orchestration`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/autonomous-execution`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/workflow-infrastructure`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/blog`, priority: 0.7, changeFrequency: "weekly" as const },

    // Competitor Alternative Engineering Docs
    { url: `${baseUrl}/docs/temporal-alternative`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/docs/langgraph-alternative`, priority: 0.8, changeFrequency: "weekly" as const },
  ];

  const mappedStaticEntries = staticRoutes.map((route) => ({
    url: route.url,
    lastModified: staticBuildDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const mappedPostEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const mappedTemplateEntries = workflowTemplates.map((template) => ({
    url: `${baseUrl}/templates/${template.slug}`,
    lastModified: staticBuildDate,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...mappedStaticEntries, ...mappedPostEntries, ...mappedTemplateEntries];
}