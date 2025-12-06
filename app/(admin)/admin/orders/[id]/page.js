"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Package,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Mail,
  Edit,
  Save,
  RotateCcw,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { getOrderById, updateOrderStatus } from "@/lib/api/order";

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ thanh toán",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    icon: Clock,
  },
  PAID: {
    label: "Đã thanh toán",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: XCircle,
  },
  FAILED: {
    label: "Thất bại",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    icon: AlertCircle,
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    icon: RotateCcw,
  },
};

function PageHeader({ order, onOpenStatusDialog }) {
  const statusConfig = STATUS_CONFIG[order?.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Chi tiết đơn hàng</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                {order?.id?.slice(0, 8)}...
              </span>
              <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      {order && (
        <Button variant="outline" size="sm" onClick={onOpenStatusDialog}>
          <Edit className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Cập nhật trạng thái</span>
          <span className="sm:hidden">Cập nhật</span>
        </Button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between p-3 border rounded-lg">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Không thể tải đơn hàng</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        {error || "Đơn hàng không tồn tại hoặc bạn không có quyền truy cập"}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/orders">Quay lại</Link>
        </Button>
        {onRetry && (
          <Button onClick={onRetry}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        )}
      </div>
    </div>
  );
}

function CustomerCard({ user }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4" />
          Thông tin khách hàng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.fullName || "N/A"}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{user?.email || "N/A"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderItemsCard({ items, totalCents }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          Sản phẩm ({items?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items?.length > 0 ? (
          <>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} x {formatCurrency(item.unitPriceCents)}
                  </p>
                </div>
                <p className="font-semibold text-green-600 ml-4">
                  {formatCurrency(item.totalPriceCents)}
                </p>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold">Tổng cộng</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(totalCents)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-8">
            <Inbox className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Không có sản phẩm</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentsCard({ payments }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" />
          Thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments?.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="p-3 rounded-lg border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{payment.provider}</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(payment.amountCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {payment.status === "SUCCESS" ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    <span>{payment.status === "SUCCESS" ? "Thành công" : payment.status}</span>
                  </div>
                  <span>{formatDate(payment.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Chưa có thanh toán</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryCard({ order }) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Tóm tắt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Mã đơn hàng</p>
          <p className="font-mono text-xs break-all">{order.id}</p>
        </div>
        <Separator />
        <div>
          <p className="text-xs text-muted-foreground mb-1">Trạng thái</p>
          <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Tiền tệ</p>
          <p className="font-medium text-sm">{order.currency}</p>
        </div>
        <Separator />
        <div>
          <p className="text-xs text-muted-foreground mb-1">Ngày tạo</p>
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            {formatDate(order.createdAt)}
          </div>
        </div>
        {order.paidAt && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ngày thanh toán</p>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-3 w-3" />
              {formatDate(order.paidAt)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusUpdateDialog({
  open,
  onOpenChange,
  order,
  newStatus,
  setNewStatus,
  reason,
  setReason,
  isUpdating,
  onUpdate,
  isAllowed,
}) {
  const currentConfig = STATUS_CONFIG[order?.status] || STATUS_CONFIG.PENDING;
  const CurrentIcon = currentConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái</DialogTitle>
          <DialogDescription>Thay đổi trạng thái của đơn hàng này</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Trạng thái hiện tại</p>
            <Badge variant="outline" className={cn("text-xs", currentConfig.color)}>
              <CurrentIcon className="h-3 w-3 mr-1" />
              {currentConfig.label}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Trạng thái mới</p>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            {!isAllowed && newStatus !== order?.status && (
              <p className="text-xs text-red-600 mt-1">
                Không thể chuyển từ {currentConfig.label} sang {STATUS_CONFIG[newStatus]?.label}
              </p>
            )}
          </div>
          {newStatus === "CANCELLED" && (
            <div>
              <p className="text-sm font-medium mb-2">
                Lý do hủy <span className="text-red-500">*</span>
              </p>
              <Textarea
                placeholder="Nhập lý do hủy đơn hàng (15-200 ký tự)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={200}
                rows={3}
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={reason.length < 15 ? "text-red-500" : "text-muted-foreground"}>
                  {reason.length < 15 ? `Cần thêm ${15 - reason.length} ký tự` : "Đủ ký tự"}
                </span>
                <span className="text-muted-foreground">{reason.length}/200</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Hủy
          </Button>
          <Button
            onClick={onUpdate}
            disabled={
              isUpdating ||
              !isAllowed ||
              (newStatus === "CANCELLED" && (reason.length < 15 || reason.length > 200))
            }
            className="w-full sm:w-auto"
          >
            {isUpdating ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Cập nhật
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminOrderDetailPage() {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOrderById(orderId);
      if (result.success) {
        setOrder(result.data);
        setNewStatus(result.data.status);
      } else {
        setError(result.error || "Không thể tải thông tin đơn hàng");
      }
    } catch {
      setError("Có lỗi xảy ra khi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) loadOrder();
  }, [orderId, loadOrder]);

  const isStatusUpdateAllowed = useCallback(
    (currentStatus, targetStatus) => {
      const allowedTransitions = {
        PENDING: ["PAID", "CANCELLED"],
        PAID: ["REFUNDED"],
        CANCELLED: [],
        REFUNDED: [],
      };
      return allowedTransitions[currentStatus]?.includes(targetStatus) || false;
    },
    []
  );

  const handleStatusUpdate = useCallback(async () => {
    if (newStatus === order.status) {
      setShowStatusDialog(false);
      return;
    }

    if (newStatus === "CANCELLED" && (statusReason.length < 15 || statusReason.length > 200)) {
      toast.error("Lý do hủy đơn phải từ 15-200 ký tự");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateOrderStatus(
        order.id,
        newStatus,
        newStatus === "CANCELLED" ? statusReason : null
      );

      if (result.success) {
        toast.success("Cập nhật trạng thái thành công");
        setShowStatusDialog(false);
        setStatusReason("");
        loadOrder();
      } else {
        toast.error(result.error || "Không thể cập nhật trạng thái");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setIsUpdating(false);
    }
  }, [order, newStatus, statusReason, loadOrder]);

  const handleOpenStatusDialog = useCallback(() => {
    setNewStatus(order?.status || "");
    setStatusReason("");
    setShowStatusDialog(true);
  }, [order]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Chi tiết đơn hàng</h1>
        </div>
        <Card>
          <CardContent className="p-0">
            <ErrorState error={error} onRetry={loadOrder} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader order={order} onOpenStatusDialog={handleOpenStatusDialog} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
          <CustomerCard user={order.user} />
          <OrderItemsCard items={order.items} totalCents={order.totalCents} />
          <PaymentsCard payments={order.payments} />
        </div>
        <div className="order-1 lg:order-2">
          <SummaryCard order={order} />
        </div>
      </div>

      <StatusUpdateDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        order={order}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        reason={statusReason}
        setReason={setStatusReason}
        isUpdating={isUpdating}
        onUpdate={handleStatusUpdate}
        isAllowed={isStatusUpdateAllowed(order.status, newStatus)}
      />
    </div>
  );
}
