"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Ticket,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Inbox,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMyVouchers, deleteVoucher } from "@/lib/api/voucher";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import VoucherFormDialog from "@/components/instructor/vouchers/voucher-form-dialog";
import DeleteVoucherDialog from "@/components/instructor/vouchers/delete-voucher-dialog";

function PageHeader({ onCreateClick }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <Ticket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Voucher</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý mã giảm giá cho khóa học của bạn
          </p>
        </div>
      </div>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Tạo voucher
      </Button>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    ACTIVE: { label: "Hoạt động", variant: "default" },
    INACTIVE: { label: "Ngừng", variant: "secondary" },
    EXPIRED: { label: "Hết hạn", variant: "outline" },
  };
  const { label, variant } = config[status] || { label: status, variant: "outline" };
  return <Badge variant={variant}>{label}</Badge>;
}

function VoucherCard({ voucher, onEdit, onDelete, onCopyCode }) {
  const isPercentage = voucher.discountType === "PERCENTAGE";
  const discountText = isPercentage
    ? `${voucher.discountValue}%`
    : `${Number(voucher.discountValue).toLocaleString()}đ`;

  const isExpired = new Date(voucher.endDate) < new Date();
  const isNotStarted = new Date(voucher.startDate) > new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono font-semibold truncate">
              {voucher.code}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              onClick={() => onCopyCode(voucher.code)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(voucher)}>
                <Pencil className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(voucher)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">-{discountText}</span>
            <StatusBadge status={voucher.status} />
          </div>

          {voucher.maxDiscountAmount && isPercentage && (
            <p className="text-xs text-muted-foreground">
              Giảm tối đa: {Number(voucher.maxDiscountAmount).toLocaleString()}đ
            </p>
          )}

          {voucher.minOrderAmount > 0 && (
            <p className="text-xs text-muted-foreground">
              Đơn tối thiểu: {Number(voucher.minOrderAmount).toLocaleString()}đ
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>
              Đã dùng: {voucher.usedCount}/{voucher.usageLimit || "∞"}
            </span>
            <span>
              {voucher.scope === "ALL_INSTRUCTOR_COURSES"
                ? "Tất cả khóa học"
                : `${voucher.applicableCourses?.length || 0} khóa học`}
            </span>
          </div>

          <div className="text-xs text-muted-foreground">
            {isNotStarted ? (
              <span className="text-amber-600">
                Bắt đầu: {format(new Date(voucher.startDate), "dd/MM/yyyy HH:mm", { locale: vi })}
              </span>
            ) : isExpired ? (
              <span className="text-red-500">
                Hết hạn: {format(new Date(voucher.endDate), "dd/MM/yyyy HH:mm", { locale: vi })}
              </span>
            ) : (
              <span>
                Đến: {format(new Date(voucher.endDate), "dd/MM/yyyy HH:mm", { locale: vi })}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VouchersSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">Chưa có voucher nào</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        Tạo voucher để khuyến mãi cho học viên của bạn
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Tạo voucher đầu tiên
      </Button>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="font-semibold mb-1">Không thể tải dữ liệu</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        Đã xảy ra lỗi khi tải danh sách voucher
      </p>
      <Button onClick={onRetry}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Thử lại
      </Button>
    </div>
  );
}

export default function VouchersContent() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const pageSize = 12;

  const fetchVouchers = useCallback(async (pageNum, status) => {
    setLoading(true);
    setError(false);
    try {
      const statusParam = status === "all" ? null : status;
      const result = await getMyVouchers(statusParam, pageNum, pageSize);
      if (result.success) {
        setVouchers(result.data.result || []);
        setMeta(result.data.meta);
        setPage(pageNum);
      } else {
        setError(true);
        toast.error(result.error);
      }
    } catch (err) {
      console.error("Error fetching vouchers:", err);
      setError(true);
      toast.error("Đã xảy ra lỗi khi tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers(1, statusFilter);
  }, [statusFilter, fetchVouchers]);

  const handleCreateClick = useCallback(() => {
    setSelectedVoucher(null);
    setFormDialogOpen(true);
  }, []);

  const handleEdit = useCallback((voucher) => {
    setSelectedVoucher(voucher);
    setFormDialogOpen(true);
  }, []);

  const handleDelete = useCallback((voucher) => {
    setSelectedVoucher(voucher);
    setDeleteDialogOpen(true);
  }, []);

  const handleCopyCode = useCallback((code) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã voucher");
  }, []);

  const handleFormSuccess = useCallback(() => {
    setFormDialogOpen(false);
    setSelectedVoucher(null);
    fetchVouchers(page, statusFilter);
  }, [fetchVouchers, page, statusFilter]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedVoucher) return;
    
    const result = await deleteVoucher(selectedVoucher.id);
    if (result.success) {
      toast.success("Đã xóa voucher");
      setDeleteDialogOpen(false);
      setSelectedVoucher(null);
      fetchVouchers(page, statusFilter);
    } else {
      toast.error(result.error);
    }
  }, [selectedVoucher, fetchVouchers, page, statusFilter]);

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      fetchVouchers(page - 1, statusFilter);
    }
  }, [page, statusFilter, fetchVouchers]);

  const handleNextPage = useCallback(() => {
    if (meta && page < meta.pages) {
      fetchVouchers(page + 1, statusFilter);
    }
  }, [page, meta, statusFilter, fetchVouchers]);

  const handleRetry = useCallback(() => {
    fetchVouchers(1, statusFilter);
  }, [fetchVouchers, statusFilter]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
      <PageHeader onCreateClick={handleCreateClick} />

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Ngừng</SelectItem>
            <SelectItem value="EXPIRED">Hết hạn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-0">
            <ErrorState onRetry={handleRetry} />
          </CardContent>
        </Card>
      ) : loading ? (
        <VouchersSkeleton />
      ) : vouchers.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState onCreateClick={handleCreateClick} />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCopyCode={handleCopyCode}
              />
            ))}
          </div>

          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {page}/{meta.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page === meta.pages}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <VoucherFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        voucher={selectedVoucher}
        onSuccess={handleFormSuccess}
      />

      <DeleteVoucherDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        voucher={selectedVoucher}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
