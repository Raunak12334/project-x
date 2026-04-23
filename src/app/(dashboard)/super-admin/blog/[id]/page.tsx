import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import { BlogPostForm } from "../blog-post-form";

export const dynamic = "force-dynamic";

type EditBlogPostPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export default async function EditBlogPostPage({
  params,
  searchParams,
}: EditBlogPostPageProps) {
  const { id } = await params;
  const { created, updated } = await searchParams;
  const post = await prisma.blogPost.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      status: true,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Edit blog post
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Changes are reflected on the public blog after saving.
          </p>
        </div>
        <div className="flex gap-3">
          {post.status === "PUBLISHED" ? (
            <Button asChild variant="outline">
              <Link href={`/blog/${post.slug}`} target="_blank">
                View live post
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/super-admin/blog">Back to Blog Studio</Link>
          </Button>
        </div>
      </div>

      {created ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          <AlertTitle>Blog post created</AlertTitle>
          <AlertDescription>
            The post was saved successfully. You can keep editing it here.
          </AlertDescription>
        </Alert>
      ) : null}

      {updated ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          <AlertTitle>Blog post updated</AlertTitle>
          <AlertDescription>
            Your latest changes were saved successfully.
          </AlertDescription>
        </Alert>
      ) : null}

      <BlogPostForm post={post} />
    </div>
  );
}
