import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlogPostForm } from "../blog-post-form";

export const dynamic = "force-dynamic";

export default function NewBlogPostPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            New blog post
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Draft it privately, then publish when it is ready for public
            readers.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/super-admin/blog">Back to Blog Studio</Link>
        </Button>
      </div>

      <BlogPostForm />
    </div>
  );
}
