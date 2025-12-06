"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  X,
  Wallet,
  Inbox,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { createWithdrawal, getWithdrawalHistory, getInstructorWalletBalance, cancelWithdrawal } from "@/lib/api/instructor";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_CONFIG = {
  PENDING: {
    label: "Đang chờ",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    iconColor: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    icon: Clock,
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    iconColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    icon: AlertCircle,
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    iconColor: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    iconColor: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    icon: XCircle,
  },
  FAILED: {
    label: "Thất bại",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    iconColor: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    icon: XCircle,
  },
};

function PageHeader() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/instructor/wallet">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Rút tiền</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Tạo yêu cầu và theo dõi lịch sử
          </p>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ balance, loading }) {
  const formatAmount = (amount) => (amount || 0).toLocaleString();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0">
            <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground">Số dư khả dụng</p>
            <p className="text-lg sm:text-xl font-bold">
              {formatAmount(balance?.availableBalanceCents)}{" "}
              <span className="text-sm font-normal">VND</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WithdrawForm({ balance, loading, creating, onSubmit, amountVND, setAmountVND }) {
  const formatAmount = (amount) => (amount || 0).toLocaleString();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tạo yêu cầu rút tiền</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm">Số tiền (VND)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Nhập số tiền muốn rút"
              value={amountVND}
              onChange={(e) => setAmountVND(e.target.value)}
              disabled={creating || loading}
              min="1"
              step="1"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Khả dụng: {formatAmount(balance?.availableBalanceCents)} VND
            </p>
          </div>
          <Button type="submit" disabled={creating || loading} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {creating ? "Đang xử lý..." : "Tạo yêu cầu"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function WithdrawalItem({ withdrawal, onCancel }) {
  const statusConfig = STATUS_CONFIG[withdrawal.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;
  const formatAmount = (amount) => (amount || 0).toLocaleString();

  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${statusConfig.iconColor}`}>
        <StatusIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-sm">
                {formatAmount(withdrawal.originalAmountCents)} VND
              </p>
              <Badge variant="outline" className={`text-[10px] sm:text-xs ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              {format(new Date(withdrawal.createdAt), "dd/MM/yyyy HH:mm")}
            </p>
            {withdrawal.adminNote && (
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
                Ghi chú: {withdrawal.adminNote}
              </p>
            )}
          </div>
          {withdrawal.status === "PENDING" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(withdrawal)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-7 px-2 text-xs"
            >
              <X className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Hủy</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function WithdrawalsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
        <Inbox className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1 text-sm">Chưa có yêu cầu rút tiền</h3>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Tạo yêu cầu rút tiền ở form bên trên
      </p>
    </div>
  );
}

export default function WithdrawalsPage() {
  const [balance, setBalance] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [amountVND, setAmountVND] = useState("");
  const [creating, setCreating] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const pageSize = 20;

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getInstructorWalletBalance();
      if (result.success) {
        setBalance(result.data);
      } else {
        toast.error(result.error || "Không thể tải số dư ví");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Đã xảy ra lỗi khi tải số dư ví");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWithdrawals = useCallback(async (pageNum) => {
    setWithdrawalsLoading(true);
    try {
      const result = await getWithdrawalHistory(pageNum, pageSize);
      if (result.success) {
        setWithdrawals(result.data.result);
        setMeta(result.data.meta);
        setPage(pageNum);
      } else {
        toast.error(result.error || "Không thể tải lịch sử rút tiền");
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Đã xảy ra lỗi khi tải lịch sử rút tiền");
    } finally {
      setWithdrawalsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchWithdrawals(1);
  }, [fetchBalance, fetchWithdrawals]);

  const handleCreateWithdrawal = useCallback(async (e) => {
    e.preventDefault();

    const amount = parseInt(amountVND);
    if (!amount || amount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (amount > (balance?.availableBalanceCents || 0)) {
      toast.error("Số dư không đủ để rút tiền");
      return;
    }

    setCreating(true);
    try {
      const result = await createWithdrawal(amount, "VND");
      if (result.success) {
        toast.success("Tạo yêu cầu rút tiền thành công");
        setAmountVND("");
        await fetchBalance();
        await fetchWithdrawals(1);
      } else {
        toast.error(result.error || "Không thể tạo yêu cầu rút tiền");
      }
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      toast.error("Đã xảy ra lỗi khi tạo yêu cầu rút tiền");
    } finally {
      setCreating(false);
    }
  }, [amountVND, balance, fetchBalance, fetchWithdrawals]);

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      fetchWithdrawals(page - 1);
    }
  }, [page, fetchWithdrawals]);

  const handleNextPage = useCallback(() => {
    if (meta && page < meta.pages) {
      fetchWithdrawals(page + 1);
    }
  }, [page, meta, fetchWithdrawals]);

  const handleOpenCancelDialog = useCallback((withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setCancelDialogOpen(true);
  }, []);

  const handleCancelWithdrawal = useCallback(async () => {
    if (!selectedWithdrawal) return;

    setCancelling(true);
    try {
      const result = await cancelWithdrawal(selectedWithdrawal.id);
      if (result.success) {
        toast.success("Hủy yêu cầu rút tiền thành công");
        setCancelDialogOpen(false);
        setSelectedWithdrawal(null);
        await fetchBalance();
        await fetchWithdrawals(page);
      } else {
        toast.error(result.error || "Không thể hủy yêu cầu rút tiền");
      }
    } catch (error) {
      console.error("Error cancelling withdrawal:", error);
      toast.error("Đã xảy ra lỗi khi hủy yêu cầu rút tiền");
    } finally {
      setCancelling(false);
    }
  }, [selectedWithdrawal, fetchBalance, fetchWithdrawals, page]);

  const formatAmount = (amount) => (amount || 0).toLocaleString();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
      <PageHeader />

      <div className="grid gap-4 sm:grid-cols-2">
        <BalanceCard balance={balance} loading={loading} />
        <WithdrawForm
          balance={balance}
          loading={loading}
          creating={creating}
          onSubmit={handleCreateWithdrawal}
          amountVND={amountVND}
          setAmountVND={setAmountVND}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Lịch sử rút tiền
          </CardTitle>
          <CardDescription>
            {meta ? `${meta.total} yêu cầu` : "Các yêu cầu gần đây"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <WithdrawalsSkeleton />
          ) : withdrawals.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <WithdrawalItem
                  key={withdrawal.id}
                  withdrawal={withdrawal}
                  onCancel={handleOpenCancelDialog}
                />
              ))}

              {meta && meta.pages > 1 && (
                <div className="flex items-center justify-between gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="flex-1 sm:flex-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Trước</span>
                  </Button>
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {page}/{meta.pages}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page === meta.pages}
                    className="flex-1 sm:flex-none"
                  >
                    <span className="hidden sm:inline mr-1">Sau</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy yêu cầu rút tiền?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Bạn có chắc chắn muốn hủy yêu cầu này?</p>
                {selectedWithdrawal && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      {formatAmount(selectedWithdrawal.originalAmountCents)} VND
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(selectedWithdrawal.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={cancelling} className="mt-0">
              Không
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelWithdrawal}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
