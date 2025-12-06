"use client";

import { memo, useMemo, useCallback } from "react";
import Link from "next/link";
import { useOrders } from "@/hooks/use-orders";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Filter,
  Calendar as CalendarIcon,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
};

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "FAILED", label: "Thất bại" },
];

const PageHeader = memo(function PageHeader({ total }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Quản lý đơn hàng
          </h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            {total > 0 ? `${total} đơn hàng trong hệ thống` : "Xem và quản lý tất cả đơn hàng"}
          </p>
        </div>
      </div>
    </div>
  );
});

const StatCard = memo(function StatCard({ title, value, icon: Icon, color, isCurrency }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
            <p className={cn("text-lg sm:text-xl lg:text-2xl font-bold", color)}>
              {isCurrency ? formatCurrency(value) : value}
            </p>
          </div>
          <div className={cn("p-2 rounded-full", color ? `${color}/10` : "bg-muted")}>
            <Icon className={cn("h-5 w-5", color || "text-muted-foreground")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const Statistics = memo(function Statistics({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatCard title="Tổng đơn hàng" value={stats.total} icon={Package} />
      <StatCard
        title="Chờ thanh toán"
        value={stats.pending}
        icon={Clock}
        color="text-yellow-600"
      />
      <StatCard
        title="Đã thanh toán"
        value={stats.paid}
        icon={CheckCircle}
        color="text-green-600"
      />
      <StatCard
        title="Đã hủy"
        value={stats.cancelled}
        icon={XCircle}
        color="text-red-600"
      />
      <div className="col-span-2 lg:col-span-1">
        <StatCard
          title="Tổng doanh thu"
          value={stats.totalRevenue}
          icon={DollarSign}
          color="text-green-600"
          isCurrency
        />
      </div>
    </div>
  );
});

const Filters = memo(function Filters({
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  clearFilters,
}) {
  const hasFilters = statusFilter !== "all" || dateFilter.from || dateFilter.to;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[240px] justify-start text-left font-normal",
              !dateFilter.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateFilter.from ? (
              dateFilter.to ? (
                <>
                  {format(dateFilter.from, "dd/MM/yyyy")} - {format(dateFilter.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(dateFilter.from, "dd/MM/yyyy")
              )
            ) : (
              "Chọn khoảng thời gian"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: dateFilter.from, to: dateFilter.to }}
            onSelect={(range) =>
              setDateFilter({ from: range?.from || null, to: range?.to || null })
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={clearFilters} className="flex-shrink-0">
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

const OrderItem = memo(function OrderItem({ order }) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm font-medium truncate">{order.id}</p>
            <p className="text-xs text-muted-foreground">
              {order.itemCount || 0} sản phẩm • {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pl-13 sm:pl-0">
        <div className="text-right">
          <p className="font-semibold text-green-600">{formatCurrency(order.totalCents)}</p>
          <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
          <Link href={`/admin/orders/${order.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
});

function LoadingSkeleton() {
  return (
    <div className="divide-y">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-4 w-24 ml-auto" />
            <Skeleton className="h-5 w-28 ml-auto rounded-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Không có đơn hàng</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Chưa có đơn hàng nào phù hợp với bộ lọc hiện tại
      </p>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Đã xảy ra lỗi</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">{error}</p>
      <Button variant="outline" onClick={onRetry}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Thử lại
      </Button>
    </div>
  );
}

export default function AdminOrdersPage() {
  const {
    orders,
    loading,
    error,
    pagination,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    currentPage,
    setCurrentPage,
    loadOrders,
    clearFilters,
  } = useOrders();

  const stats = useMemo(() => {
    return {
      total: pagination.total || 0,
      pending: orders.filter((o) => o.status === "PENDING").length,
      paid: orders.filter((o) => o.status === "PAID").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
      totalRevenue: orders
        .filter((o) => o.status === "PAID")
        .reduce((sum, o) => sum + (o.totalCents || 0), 0),
    };
  }, [orders, pagination.total]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, setCurrentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < pagination.pages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, pagination.pages, setCurrentPage]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader total={pagination.total} />

      <Statistics stats={stats} />

      <Filters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        clearFilters={clearFilters}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Danh sách đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState error={error} onRetry={loadOrders} />
          ) : orders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y">
              {orders.map((order) => (
                <OrderItem key={order.id} order={order} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && !error && pagination.pages > 1 && (
        <div className="flex items-center justify-center sm:justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground hidden sm:block">
            Trang {currentPage} / {pagination.pages} • Tổng {pagination.total} đơn hàng
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Trước</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= pagination.pages}
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
