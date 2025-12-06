"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, FileEdit, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PostForm from "@/components/content/post-form";
import { listCategories } from "@/lib/api/content/categories";
import { adminGetPost, adminUpdatePost } from "@/lib/api/content/posts";

function PageHeader({ title }) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/admin/content/posts">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <FileEdit className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Chỉnh sửa bài viết</h1>
          <p className="text-sm text-muted-foreground hidden sm:block truncate max-w-md">
            {title || "Đang tải..."}
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

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Không thể tải bài viết</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          {message || "Đã xảy ra lỗi khi tải thông tin bài viết"}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/content/posts">Quay lại</Link>
          </Button>
          {onRetry && (
            <Button onClick={onRetry}>Thử lại</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPostEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, postRes] = await Promise.all([
        listCategories(),
        adminGetPost(id),
      ]);

      if (catRes.success) {
        const data = catRes.data;
        const catsContent = Array.isArray(data?.result)
          ? data.result
          : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
          ? data
          : [];
        setCategories(catsContent);
      }

      if (postRes.success) {
        setInitial(postRes.data);
      } else {
        setError(postRes.error || "Không tìm thấy bài viết");
      }
    } catch {
      setError("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdate = useCallback(async (payload) => {
    setSaving(true);
    try {
      const res = await adminUpdatePost(id, payload);
      if (res.success) {
        toast.success("Cập nhật bài viết thành công");
        router.push("/admin/content/posts");
      } else {
        toast.error(res.error || "Cập nhật bài viết thất bại");
      }
    } finally {
      setSaving(false);
    }
  }, [id, router]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
      <PageHeader title={initial?.title} />

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bài viết</CardTitle>
            <CardDescription>
              Chỉnh sửa thông tin bài viết
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostForm
              initial={initial}
              categories={categories}
              onSubmit={handleUpdate}
              submitting={saving}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
