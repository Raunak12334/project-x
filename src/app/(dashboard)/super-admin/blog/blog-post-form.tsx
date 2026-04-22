import type { BlogPostStatus } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBlogPost, updateBlogPost } from "./actions";

type EditableBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  status: BlogPostStatus;
};

type BlogPostFormProps = {
  post?: EditableBlogPost;
};

const statusOptions: BlogPostStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export function BlogPostForm({ post }: BlogPostFormProps) {
  const action = post ? updateBlogPost : createBlogPost;

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Story content</CardTitle>
          <CardDescription>
            Write public-facing blog content for readers who are not logged in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              minLength={3}
              defaultValue={post?.title}
              placeholder="How to design reliable AI agent workflows"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={post?.excerpt}
              placeholder="A short summary shown on the blog listing and social previews."
              className="min-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              required
              minLength={20}
              defaultValue={post?.content}
              placeholder={
                "Use simple markdown-like text:\n## Heading\n- Bullet point\nParagraph text"
              }
              className="min-h-[520px] font-mono text-sm leading-7"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
            <CardDescription>
              Drafts stay hidden. Published posts are visible at `/blog`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={post?.status ?? "DRAFT"}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={post?.slug}
                placeholder="reliable-ai-agent-workflows"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty on new posts to generate from the title.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover image URL</Label>
              <Input
                id="coverImage"
                name="coverImage"
                defaultValue={post?.coverImage ?? ""}
                placeholder="https://... or /images/blog-cover.png"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="flex gap-3 pt-6">
            <Button type="submit" className="flex-1">
              {post ? "Save changes" : "Create post"}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/super-admin/blog">Cancel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
