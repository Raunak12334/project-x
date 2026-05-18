import type { MetadataRoute } from "next";
import { isMissingBlogTableError } from "@/features/blog/db";
import { workflowTemplates } from "@/features/templates/lib/workflow-templates";
import prisma from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  return [
    {
      url: "https://www.otogent.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://www.otogent.com/pricing",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.otogent.com/features",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.otogent.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://www.otogent.com/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://www.otogent.com/docs",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // Phase 1: Authority Hub Pages
    {
      url: "https://www.otogent.com/multi-agent-automation",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://www.otogent.com/agentic-workflows",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://www.otogent.com/ai-workflow-orchestration",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://www.otogent.com/autonomous-execution",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://www.otogent.com/workflow-infrastructure",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://www.otogent.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `https://www.otogent.com/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...workflowTemplates.map((template) => ({
      url: `https://www.otogent.com/templates/${template.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
