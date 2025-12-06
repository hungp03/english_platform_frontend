"use client";

import React, { useEffect, useState, useCallback, memo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  adminSearchPostsPaged,
  adminPublishPost,
  adminUnpublishPost,
  adminDeletePost,
} from "@/lib/api/content/posts";
import { Pagination } from "@/components/ui/pagination";
import useDebouncedValue from "@/hooks/use-debounced-value";
import DeleteItemDialog from "@/components/content/delete-content-dialog";
import {
  FileText,
  Plus,
  Search,
  Filter,
  X,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Link as LinkIcon,
  FileX,
} from "lucide-react";

const PageHeader = memo(function PageHeader() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">Quản lý bài viết</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Tạo và quản lý các bài viết trên hệ thống
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="sm:size-default flex-shrink-0">
        <Link href="/admin/content/posts/new">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Tạo bài</span>
        </Link>
      </Button>
    </div>
  );
});

const PostFilters = memo(function PostFilters({ keyword, onKeywordChange, published, onPublishedChange, onClear }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tiêu đề..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-2">
        <Select value={published} onValueChange={onPublishedChange}>
          <SelectTrigger className="flex-1 sm:w-[160px]">
            <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đã xuất bản</SelectItem>
            <SelectItem value="false">Nháp</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onClear} className="flex-shrink-0">
          <X className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Xóa lọc</span>
        </Button>
      </div>
    </div>
  );
});

const PostItem = memo(function PostItem({ post, onPublish, onUnpublish, onDelete }) {
  return (
    <div className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg flex-shrink-0 ${post.published ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
          {post.published ? (
            <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <EyeOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm sm:text-base line-clamp-2 sm:truncate">{post.title || "(Không tiêu đề)"}</div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <LinkIcon className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[200px]">{post.slug || "(chưa có slug)"}</span>
            </div>
            <Badge variant={post.published ? "default" : "secondary"} className="text-xs">
              {post.published ? "Đã xuất bản" : "Nháp"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t sm:mt-0 sm:pt-0 sm:border-t-0 sm:absolute sm:relative sm:justify-end">
        <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
          <Link href={`/admin/content/posts/${post.id}/edit`}>
            <Pencil className="h-4 w-4 sm:mr-1" />
            <span className="sm:inline">Sửa</span>
          </Link>
        </Button>
        {post.published ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUnpublish(post.id, post.title)}
            className="flex-1 sm:flex-none"
          >
            <EyeOff className="h-4 w-4 sm:mr-1" />
            <span className="sm:inline">Ẩn</span>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPublish(post.id, post.title)}
            className="flex-1 sm:flex-none"
          >
            <Eye className="h-4 w-4 sm:mr-1" />
            <span className="sm:inline">Xuất bản</span>
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(post)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-full sm:w-64 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-24 sm:w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t sm:mt-0 sm:pt-0 sm:border-t-0">
            <Skeleton className="h-9 flex-1 sm:flex-none sm:w-20" />
            <Skeleton className="h-9 flex-1 sm:flex-none sm:w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <FileX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Không có bài viết</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        Chưa có bài viết nào. Bắt đầu tạo bài viết mới.
      </p>
      <Button asChild>
        <Link href="/admin/content/posts/new">
          <Plus className="h-4 w-4 mr-2" />
          Tạo bài viết
        </Link>
      </Button>
    </div>
  );
}

export default function AdminPostsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, 500);

  const [published, setPublished] = useState("all");

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState(0);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState("");

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p, pageSize };
      if (debouncedKeyword?.trim()) params.keyword = debouncedKeyword.trim();
      if (published !== "all") params.published = published === "true";

      const res = await adminSearchPostsPaged(params);

      if (res.success) {
        const { items: resItems, meta } = res.data;

        let filtered = resItems;
        if (published !== "all") {
          const expect = published === "true";
          filtered = resItems.filter((x) => !!x.published === expect);
        }
        if (debouncedKeyword?.trim()) {
          const q = debouncedKeyword.toLowerCase();
          filtered = filtered.filter((x) =>
            (x.title || "").toLowerCase().includes(q)
          );
        }

        setItems(filtered);
        setTotalPages(meta?.pages ?? 0);
      } else {
        toast.error(res.error || "Tải danh sách thất bại");
      }
    } catch {
      toast.error("Tải danh sách thất bại");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedKeyword, published]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, published]);

  useEffect(() => {
    load(page);
  }, [page, debouncedKeyword, published, load]);

  const openDeleteDialog = useCallback((post) => {
    setDeleteId(post.id);
    setDeleteTitle(post.title || "(không tiêu đề)");
    setOpenDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteId) return;

    const previousItems = items;
    setItems((prev) => prev.filter((item) => item.id !== deleteId));
    setOpenDelete(false);

    const res = await adminDeletePost(deleteId);
    if (res.success) {
      toast.success("Đã xóa bài");
    } else {
      setItems(previousItems);
      toast.error(res.error || "Xóa thất bại");
    }

    setDeleteId(null);
    setDeleteTitle("");
  }, [deleteId, items]);

  const handlePublish = useCallback(async (id, title) => {
    const previousItems = items;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, published: true } : item))
    );

    const res = await adminPublishPost(id);
    if (res.success) {
      toast.success(`Đã xuất bản: "${title || "bài viết"}"`);
    } else {
      setItems(previousItems);
      toast.error(res.error || "Thao tác thất bại");
    }
  }, [items]);

  const handleUnpublish = useCallback(async (id, title) => {
    const previousItems = items;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, published: false } : item))
    );

    const res = await adminUnpublishPost(id);
    if (res.success) {
      toast.success(`Đã chuyển về nháp: "${title || "bài viết"}"`);
    } else {
      setItems(previousItems);
      toast.error(res.error || "Thao tác thất bại");
    }
  }, [items]);

  const handleClearFilters = useCallback(() => {
    setKeyword("");
    setPublished("all");
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader />

      <PostFilters
        keyword={keyword}
        onKeywordChange={setKeyword}
        published={published}
        onPublishedChange={setPublished}
        onClear={handleClearFilters}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách bài viết</CardTitle>
          <CardDescription>
            {!loading && `${items.length} bài viết`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {items.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  onPublish={handlePublish}
                  onUnpublish={handleUnpublish}
                  onDelete={openDeleteDialog}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <DeleteItemDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        itemTitle={deleteTitle}
        onConfirm={handleConfirmDelete}
        title="Xóa bài viết"
        description={`Bạn có chắc chắn muốn xóa bài viết "${deleteTitle}"?\n\nHành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
