"use client";

import { motion } from "framer-motion";

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
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

type PostRow = {
  id: string;
  mediaType: string | null;
  caption: string | null;
  status: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  mediaUrls: string[] | null;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "success" | "warning" | "info" | "destructive" | "secondary"> = {
    published: "success",
    scheduled: "info",
    draft: "secondary",
    processing: "warning",
    partial: "warning",
    failed: "destructive",
  };
  return <Badge variant={map[status] ?? "secondary"}>{status}</Badge>;
}

export function RecentPostsCard({ posts }: { posts: PostRow[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent posts</CardTitle>
          <CardDescription>Latest posts across your connected account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Scheduled</TableHead>
                  <TableHead className="hidden md:table-cell">Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No posts yet. Create your first post from the compose page.
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id} className="transition-colors hover:bg-muted/40">
                      <TableCell className="max-w-[200px] truncate font-medium sm:max-w-[260px]">
                        {post.caption || "(no caption)"}
                      </TableCell>
                      <TableCell className="hidden capitalize sm:table-cell">
                        {post.mediaType}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={post.status} />
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {formatDateTime(post.scheduledAt?.toISOString() ?? "")}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {formatDateTime(post.publishedAt?.toISOString() ?? "")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
