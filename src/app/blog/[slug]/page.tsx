import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogContent } from "@/features/blog/components/blog-content";
import { BlogCoverImage } from "@/features/blog/components/blog-cover-image";
import { isMissingBlogTableError } from "@/features/blog/db";
import { formatBlogDate, getReadingTime } from "@/features/blog/utils";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import prisma from "@/lib/db";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost
    .findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        deletedAt: null,
        publishedAt: { not: null },
      },
      select: {
        title: true,
        excerpt: true,
        slug: true,
        coverImage: true,
      },
    })
    .catch((error) => {
      if (isMissingBlogTableError(error)) {
        return null;
      }

      throw error;
    });

  if (!post) {
    return {
      title: "Blog post not found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const posts = await prisma.blogPost
    .findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        publishedAt: { not: null },
      },
      select: { slug: true },
    })
    .catch((error) => {
      if (isMissingBlogTableError(error)) {
        return [];
      }

      throw error;
    });

  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost
    .findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        deletedAt: null,
        publishedAt: { not: null },
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    })
    .catch((error) => {
      if (isMissingBlogTableError(error)) {
        return null;
      }

      throw error;
    });

  if (!post) {
    notFound();
  }

  return (
    <main className="landing-theme min-h-screen bg-background text-foreground">
      <LandingNavbar />

      <article className="pt-28">
        <header className="container max-w-5xl py-14 text-center">
          <Badge className="mb-6 rounded-full px-4 py-1">Otogent Blog</Badge>
          <h1 className="font-brand text-5xl font-black tracking-tight md:text-7xl">
            {post.title}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-muted-foreground">
            {post.excerpt}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-muted-foreground">
            <span>By {post.author.name}</span>
            <span>{formatBlogDate(post.publishedAt)}</span>
            <span>{getReadingTime(post.content)} min read</span>
          </div>
        </header>

        <div className="container max-w-6xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-muted shadow-sm">
            <div className="relative min-h-[360px] md:min-h-[520px]">
              {post.coverImage ? (
                <BlogCoverImage
                  src={post.coverImage}
                  alt=""
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.45),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.35),transparent_26%),linear-gradient(135deg,#020617,#172554_48%,#0f766e)]" />
              )}
            </div>
          </div>
        </div>

        <div className="container max-w-3xl py-16">
          <BlogContent content={post.content} />
          <div className="mt-14 border-t border-border pt-8">
            <Button asChild variant="outline">
              <Link href="/blog">Back to all posts</Link>
            </Button>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
