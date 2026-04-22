import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogCoverImage } from "@/features/blog/components/blog-cover-image";
import { isMissingBlogTableError } from "@/features/blog/db";
import { formatBlogDate, getReadingTime } from "@/features/blog/utils";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read Otogent product updates, automation playbooks, and AI agent workflow guides.",
  alternates: {
    canonical: "/blog",
  },
};

export default async function BlogPage() {
  const posts = await prisma.blogPost
    .findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    })
    .catch((error) => {
      if (isMissingBlogTableError(error)) {
        return [];
      }

      throw error;
    });

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <main className="landing-theme min-h-screen bg-background text-foreground">
      <LandingNavbar />

      <section className="relative overflow-hidden border-b border-border pt-32 pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.14),transparent_30%)]" />
        <div className="container">
          <Badge className="mb-6 rounded-full px-4 py-1">Otogent Blog</Badge>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl font-brand text-5xl font-black tracking-tight md:text-7xl">
                Field notes for building useful AI agents.
              </h1>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Product updates, automation strategy, integration guides, and
              practical lessons from designing multi-agent workflows in Otogent.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-16">
        {posts.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Coming soon
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight">
              No published posts yet.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              The blog is public and ready. Published posts from the super-admin
              dashboard will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {featuredPost ? (
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl lg:grid-cols-[1.1fr_0.9fr]"
              >
                <div className="relative min-h-[320px] bg-muted">
                  {featuredPost.coverImage ? (
                    <BlogCoverImage
                      src={featuredPost.coverImage}
                      alt=""
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.34),transparent_28%),linear-gradient(135deg,#0f172a,#1d4ed8_55%,#14b8a6)]" />
                  )}
                </div>
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    <span>{formatBlogDate(featuredPost.publishedAt)}</span>
                    <span>{getReadingTime(featuredPost.content)} min read</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight transition group-hover:text-primary">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-muted-foreground">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-8">
                    <Button asChild>
                      <span>Read featured post</span>
                    </Button>
                  </div>
                </div>
              </Link>
            ) : null}

            {remainingPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {remainingPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-48 bg-muted">
                      {post.coverImage ? (
                        <BlogCoverImage
                          src={post.coverImage}
                          alt=""
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#020617,#2563eb,#14b8a6)]" />
                      )}
                    </div>
                    <div className="p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <span>{formatBlogDate(post.publishedAt)}</span>
                        <span>{getReadingTime(post.content)} min read</span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight transition group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
