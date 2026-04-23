import { formatDistanceToNow } from "date-fns";
import {
  EditIcon,
  EyeIcon,
  FileTextIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBlogDate, getReadingTime } from "@/features/blog/utils";
import prisma from "@/lib/db";
import { deleteBlogPost } from "./actions";

export const dynamic = "force-dynamic";

function getStatusBadge(status: string) {
  if (status === "PUBLISHED") {
    return <Badge className="bg-emerald-500">Published</Badge>;
  }

  if (status === "ARCHIVED") {
    return <Badge variant="outline">Archived</Badge>;
  }

  return <Badge variant="secondary">Draft</Badge>;
}

export default async function SuperAdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { deletedAt: null },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            <FileTextIcon className="size-4" />
            Public CMS
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Blog Studio
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Create, edit, publish, archive, and delete posts shown publicly at
            `/blog`.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/super-admin/blog/new">
            <PlusIcon className="size-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardDescription>Total posts</CardDescription>
            <CardTitle className="text-3xl">{posts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl">
              {posts.filter((post) => post.status === "PUBLISHED").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl">
              {posts.filter((post) => post.status === "DRAFT").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>All blog posts</CardTitle>
          <CardDescription>
            Readers can only access published posts. Drafts and archived posts
            remain hidden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <FileTextIcon className="mx-auto size-10 text-slate-300" />
              <h2 className="mt-4 text-xl font-bold">No posts yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create the first public Otogent blog post from the super-admin
                dashboard.
              </p>
              <Button asChild className="mt-6">
                <Link href="/super-admin/blog/new">Create first post</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="max-w-xl">
                        <div className="font-bold">{post.title}</div>
                        <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          /blog/{post.slug} - {getReadingTime(post.content)} min
                          read
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{post.author.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {post.author.email}
                      </div>
                    </TableCell>
                    <TableCell>{formatBlogDate(post.publishedAt)}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(post.updatedAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {post.status === "PUBLISHED" ? (
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <EyeIcon className="size-4" />
                            </Link>
                          </Button>
                        ) : null}
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/super-admin/blog/${post.id}`}>
                            <EditIcon className="size-4" />
                          </Link>
                        </Button>
                        <form action={deleteBlogPost}>
                          <input type="hidden" name="id" value={post.id} />
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            className="text-rose-600 hover:text-rose-700"
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
