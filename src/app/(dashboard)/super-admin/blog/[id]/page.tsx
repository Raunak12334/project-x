import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import { BlogPostForm } from "../blog-post-form";

type EditBlogPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const { id } = await params;
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

      <BlogPostForm post={post} />
    </div>
  );
}
