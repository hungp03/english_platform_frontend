"use client";
import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function PostCard({ post }) {
  return (
    <Card className="hover:shadow-md transition">
      <CardHeader>
        <CardTitle>
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {(post.categories || []).map(c => (
            <Badge key={c.id} variant="secondary">{c.name}</Badge>
          ))}
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true, locale: vi }) : ""}
        </div>
      </CardContent>
    </Card>
  );
}