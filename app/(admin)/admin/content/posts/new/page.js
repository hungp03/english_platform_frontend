"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PostForm from "@/components/content/post-form";
import { listCategories } from "@/lib/api/content/categories";
import { adminCreatePost } from "@/lib/api/content/posts";

function PageHeader() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/admin/content/posts">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Tạo bài viết mới</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Viết và xuất bản bài viết mới
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </CardContent>
    </Card>
  );
}

export default function AdminPostNewPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await listCategories();
        if (res.success) {
          const data = res.data;
          const content = Array.isArray(data?.result)
            ? data.result
            : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data)
            ? data
            : [];
          setCategories(content);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreate = useCallback(async (payload) => {
    setSaving(true);
    try {
      const res = await adminCreatePost(payload);
      if (res.success) {
        toast.success("Tạo bài viết thành công");
        router.push("/admin/content/posts");
      } else {
        toast.error(res.error || "Tạo bài viết thất bại");
      }
    } finally {
      setSaving(false);
    }
  }, [router]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
      <PageHeader />

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bài viết</CardTitle>
            <CardDescription>
              Điền đầy đủ thông tin để tạo bài viết mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostForm
              categories={categories}
              onSubmit={handleCreate}
              submitting={saving}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
