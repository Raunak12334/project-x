"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createExcerpt, createSlug } from "@/features/blog/utils";
import { requireSuperAdmin } from "@/lib/auth-utils";
import prisma from "@/lib/db";

const blogPostSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().optional(),
  content: z.string().trim().min(20, "Content must be at least 20 characters."),
  coverImage: z.string().trim().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

function optionalUrl(value: string | undefined) {
  if (!value) return null;

  return value;
}

async function resolveUniqueSlug(baseSlug: string, currentPostId?: string) {
  const fallbackSlug = baseSlug || `post-${Date.now()}`;
  let candidate = fallbackSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === currentPostId) {
      return candidate;
    }

    candidate = `${fallbackSlug}-${counter}`;
    counter += 1;
  }
}

function getPublishedAt(
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  previous?: Date | null,
) {
  if (status === "PUBLISHED") {
    return previous ?? new Date();
  }

  return null;
}

function parseBlogPostForm(formData: FormData) {
  const parsed = blogPostSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImage: formData.get("coverImage"),
    status: formData.get("status"),
  });

  const slug = createSlug(parsed.slug || parsed.title);
  const excerpt = parsed.excerpt || createExcerpt(parsed.content, parsed.title);

  return {
    ...parsed,
    slug,
    excerpt,
    coverImage: optionalUrl(parsed.coverImage),
  };
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function createBlogPost(formData: FormData) {
  const { user } = await requireSuperAdmin();
  const input = parseBlogPostForm(formData);
  const slug = await resolveUniqueSlug(input.slug);

  const post = await prisma.blogPost.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      coverImage: input.coverImage,
      status: input.status,
      publishedAt: getPublishedAt(input.status),
      authorId: user.id,
    },
    select: { id: true, slug: true },
  });

  revalidateBlogPaths(post.slug);
  redirect(`/super-admin/blog/${post.id}`);
}

export async function updateBlogPost(formData: FormData) {
  await requireSuperAdmin();

  const id = z.string().min(1).parse(formData.get("id"));
  const existing = await prisma.blogPost.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, slug: true, publishedAt: true },
  });

  if (!existing) {
    throw new Error("Blog post not found.");
  }

  const input = parseBlogPostForm(formData);
  const slug = await resolveUniqueSlug(input.slug, existing.id);

  await prisma.blogPost.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      coverImage: input.coverImage,
      status: input.status,
      publishedAt: getPublishedAt(input.status, existing.publishedAt),
    },
  });

  revalidateBlogPaths(existing.slug);
  revalidateBlogPaths(slug);
  redirect(`/super-admin/blog/${id}`);
}

export async function deleteBlogPost(formData: FormData) {
  await requireSuperAdmin();

  const id = z.string().min(1).parse(formData.get("id"));
  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      status: "ARCHIVED",
    },
    select: { slug: true },
  });

  revalidateBlogPaths(post.slug);
  redirect("/super-admin/blog");
}
