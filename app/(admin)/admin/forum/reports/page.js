"use client";

import { toast } from "sonner";
import { useEffect, useState, useCallback, memo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Flag,
  Filter,
  MessageSquare,
  FileText,
  ExternalLink,
  CheckCircle,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  User,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import {
  adminGetReports,
  adminResolveReport,
  adminHidePost,
  adminUnhidePost,
  adminDeletePost,
  adminDeleteThread,
} from "@/lib/api/forum";

const PageHeader = memo(function PageHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Flag className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo Forum</h1>
        <p className="text-sm text-muted-foreground">
          Xử lý các báo cáo vi phạm từ người dùng
        </p>
      </div>
    </div>
  );
});

const ReportFilters = memo(function ReportFilters({ type, onTypeChange, onlyOpen, onOnlyOpenChange }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[160px]">
          <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
          <SelectValue placeholder="Đối tượng" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="THREAD">Chủ đề</SelectItem>
          <SelectItem value="POST">Bài viết</SelectItem>
        </SelectContent>
      </Select>
      <Select value={onlyOpen} onValueChange={onOnlyOpenChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Chưa xử lý</SelectItem>
          <SelectItem value="false">Tất cả</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});

const ReportItem = memo(function ReportItem({ report, onResolve, onDelete, onHide, onUnhide }) {
  const isResolved = !!report.resolvedAt;
  const isThread = report.targetType === "THREAD";

  return (
    <div className={`border rounded-lg p-4 space-y-3 transition-colors ${isResolved ? 'bg-muted/30' : 'hover:bg-muted/50'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isThread ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
            {isThread ? (
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            )}
          </div>
          <div>
            <Badge variant={isThread ? "default" : "secondary"} className="text-xs">
              {isThread ? "Chủ đề" : "Bài viết"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {report.createdAt ? new Date(report.createdAt).toLocaleString("vi-VN") : ""}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Người báo cáo:</span>
          <span className="font-medium">{report.reporterName || report.userId}</span>
        </div>

        {isThread && report.targetPreview && (
          <div className="flex items-start gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-sm text-muted-foreground">Chủ đề: </span>
              <a
                href={`/forum/${report.targetPreview}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {report.targetPreview}
              </a>
            </div>
          </div>
        )}

        {!isThread && report.targetPreview && (
          <div className="mt-2 p-3 rounded-lg bg-muted/50 border">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Nội dung bình luận
            </div>
            <div className="text-sm whitespace-pre-wrap line-clamp-3">
              {report.targetPreview}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Lý do báo cáo</div>
            <div className="text-sm">{report.reason}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
        {isResolved ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span>
              Đã xử lý lúc {new Date(report.resolvedAt).toLocaleString("vi-VN")} bởi {report.resolvedBy}
            </span>
          </div>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => onResolve(report.id)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Đã xử lý
            </Button>

            {isThread && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete("THREAD", report.targetId)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Xóa chủ đề
              </Button>
            )}

            {!isThread && (
              <>
                {report.targetPublished !== false && (
                  <Button size="sm" variant="outline" onClick={() => onHide(report.targetId)}>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Ẩn
                  </Button>
                )}
                {report.targetPublished === false && (
                  <Button size="sm" variant="outline" onClick={() => onUnhide(report.targetId)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Hiện
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete("POST", report.targetId)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Xóa
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
});

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
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
        <ShieldCheck className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Không có báo cáo</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Hiện tại không có báo cáo nào cần xử lý
      </p>
    </div>
  );
}

export default function AdminForumReportsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const [type, setType] = useState("THREAD");
  const [onlyOpen, setOnlyOpen] = useState("true");

  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    type: null,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const params = { page: p, pageSize, type, onlyOpen: onlyOpen === "true" };
    const result = await adminGetReports(params);
    if (result.success) {
      const data = result.data;
      setItems(data?.content || data?.result || []);
      setMeta(data?.meta || { page: p, pages: data?.totalPages || 0, total: data?.total || 0 });
    } else {
      toast.error(result.error || "Không thể tải danh sách báo cáo");
      setItems([]);
      setMeta({ page: p, pages: 0, total: 0 });
    }
    setLoading(false);
  }, [page, type, onlyOpen]);

  const openDeleteConfirm = useCallback((deleteType, id) => {
    setDeleteConfirm({ open: true, type: deleteType, id });
  }, []);

  const handleDelete = useCallback(async () => {
    const { type: deleteType, id } = deleteConfirm;
    if (!deleteType || !id) return;

    setIsDeleting(true);
    try {
      const result = deleteType === "THREAD" 
        ? await adminDeleteThread(id)
        : await adminDeletePost(id);
      
      if (result.success) {
        toast.success(deleteType === "THREAD" ? "Đã xóa chủ đề" : "Đã xóa bài viết");
        setItems(prev => prev.filter(item => item.targetId !== id));
      } else {
        toast.error(result.error || `Lỗi khi xóa ${deleteType === "THREAD" ? "chủ đề" : "bài viết"}`);
      }
    } catch {
      toast.error(`Lỗi khi xóa ${deleteConfirm.type === "THREAD" ? "chủ đề" : "bài viết"}`);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ open: false, type: null, id: null });
    }
  }, [deleteConfirm]);

  const handleResolve = useCallback(async (id) => {
    const previousItems = items;
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, resolvedAt: new Date().toISOString(), resolvedBy: "Admin" } : item
    ));

    const result = await adminResolveReport(id);
    if (result.success) {
      toast.success("Đã đánh dấu báo cáo là đã xử lý");
    } else {
      setItems(previousItems);
      toast.error(result.error || "Không thể xử lý báo cáo");
    }
  }, [items]);

  const handleHide = useCallback(async (targetId) => {
    const result = await adminHidePost(targetId);
    if (result.success) {
      toast.success("Đã ẩn bài");
      setItems(prev => prev.map(item => 
        item.targetId === targetId ? { ...item, targetPublished: false } : item
      ));
    } else {
      toast.error(result.error || "Không thể ẩn bài");
    }
  }, []);

  const handleUnhide = useCallback(async (targetId) => {
    const result = await adminUnhidePost(targetId);
    if (result.success) {
      toast.success("Đã hiện bài");
      setItems(prev => prev.map(item => 
        item.targetId === targetId ? { ...item, targetPublished: true } : item
      ));
    } else {
      toast.error(result.error || "Không thể hiện bài");
    }
  }, []);

  const handleDialogClose = useCallback((open) => {
    if (!isDeleting) setDeleteConfirm(prev => ({ ...prev, open }));
  }, [isDeleting]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({ open: false, type: null, id: null });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [type, onlyOpen]);

  useEffect(() => {
    load(page);
  }, [page, type, onlyOpen, load]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader />

      <ReportFilters
        type={type}
        onTypeChange={setType}
        onlyOpen={onlyOpen}
        onOnlyOpenChange={setOnlyOpen}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {items.map((report) => (
                <ReportItem
                  key={report.id}
                  report={report}
                  onResolve={handleResolve}
                  onDelete={openDeleteConfirm}
                  onHide={handleHide}
                  onUnhide={handleUnhide}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {meta.pages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      )}

      <Dialog open={deleteConfirm.open} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Xác nhận xóa {deleteConfirm.type === "THREAD" ? "chủ đề" : "bài viết"}?
            </DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác.{" "}
              {deleteConfirm.type === "THREAD"
                ? "Toàn bộ bài viết trong chủ đề này cũng sẽ bị xóa."
                : "Bài viết này sẽ bị xóa vĩnh viễn khỏi hệ thống."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={isDeleting} onClick={handleCancelDelete}>
              Hủy bỏ
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}