"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Inbox,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getInstructorWalletBalance, getInstructorWalletTransactions } from "@/lib/api/instructor";
import { toast } from "sonner";
import { format } from "date-fns";
import BankAccountDialog from "@/components/instructor/wallet/bank-account-dialog";

function PageHeader({ onOpenBankDialog }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Ví của tôi</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý số dư và giao dịch
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/instructor/wallet/withdrawals">
            <Download className="h-4 w-4 mr-2" />
            Rút tiền
          </Link>
        </Button>
        <Button variant="outline" onClick={onOpenBankDialog} className="w-full sm:w-auto">
          <CreditCard className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Tài khoản</span>
          <span className="sm:hidden">TK nhận</span>
        </Button>
      </div>
    </div>
  );
}

function BalanceCard({ title, amount, icon: Icon, iconColor, description, loading }) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-full mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
        </div>
        <div className="text-lg sm:text-2xl font-bold break-all">
          {amount.toLocaleString()} <span className="text-sm sm:text-base font-normal">VND</span>
        </div>
        {description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function TotalBalanceCard({ available, pending, loading }) {
  const total = (available || 0) + (pending || 0);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Tổng số dư</p>
            <p className="text-xs text-muted-foreground">
              Khả dụng + Chờ xử lý
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="text-base sm:text-xl font-bold">
                {total.toLocaleString()} <span className="text-xs sm:text-sm font-normal">VND</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionItem({ transaction }) {
  const isSale = transaction.type === "SALE";

  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
      <div
        className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isSale
            ? "bg-green-100 dark:bg-green-900/30"
            : "bg-amber-100 dark:bg-amber-900/30"
        }`}
      >
        {isSale ? (
          <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm line-clamp-2 flex-1">{transaction.description}</p>
          <p
            className={`font-semibold text-sm whitespace-nowrap ${
              isSale
                ? "text-green-600 dark:text-green-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {transaction.amountCents >= 0 ? "+" : ""}
            {Math.round(transaction.amountCents || 0).toLocaleString()}
          </p>
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
          {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm")}
          <span className="hidden sm:inline">
            {" "}• Số dư: {(transaction.balanceAfterCents || 0).toLocaleString()} VND
          </span>
        </p>
      </div>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">Chưa có giao dịch nào</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Các giao dịch sẽ xuất hiện ở đây khi có người mua khóa học của bạn
      </p>
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
        Đã xảy ra lỗi khi tải thông tin ví
      </p>
      <Button onClick={onRetry}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Thử lại
      </Button>
    </div>
  );
}

export default function WalletPage() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [bankAccountDialogOpen, setBankAccountDialogOpen] = useState(false);
  const pageSize = 20;

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await getInstructorWalletBalance();
      if (result.success) {
        setBalance(result.data);
      } else {
        setError(true);
        toast.error(result.error || "Không thể tải số dư ví");
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
      setError(true);
      toast.error("Đã xảy ra lỗi khi tải số dư ví");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (pageNum) => {
    setTransactionsLoading(true);
    try {
      const result = await getInstructorWalletTransactions(pageNum, pageSize);
      if (result.success) {
        setTransactions(result.data.result);
        setMeta(result.data.meta);
        setPage(pageNum);
      } else {
        toast.error(result.error || "Không thể tải lịch sử giao dịch");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      toast.error("Đã xảy ra lỗi khi tải lịch sử giao dịch");
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchTransactions(1);
  }, [fetchBalance, fetchTransactions]);

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      fetchTransactions(page - 1);
    }
  }, [page, fetchTransactions]);

  const handleNextPage = useCallback(() => {
    if (meta && page < meta.pages) {
      fetchTransactions(page + 1);
    }
  }, [page, meta, fetchTransactions]);

  const handleOpenBankDialog = useCallback(() => {
    setBankAccountDialogOpen(true);
  }, []);

  const handleRetry = useCallback(() => {
    fetchBalance();
    fetchTransactions(1);
  }, [fetchBalance, fetchTransactions]);

  if (error && !balance) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
        <PageHeader onOpenBankDialog={handleOpenBankDialog} />
        <Card>
          <CardContent className="p-0">
            <ErrorState onRetry={handleRetry} />
          </CardContent>
        </Card>
        <BankAccountDialog
          open={bankAccountDialogOpen}
          onOpenChange={setBankAccountDialogOpen}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
      <PageHeader onOpenBankDialog={handleOpenBankDialog} />

      <div className="grid gap-4 sm:grid-cols-2">
        <BalanceCard
          title="Số dư khả dụng"
          amount={balance?.availableBalanceCents || 0}
          icon={Wallet}
          iconColor="text-green-600 dark:text-green-400"
          description="Số tiền này đã được chiết khấu 15% phí hoạt động"
          loading={loading}
        />
        <BalanceCard
          title="Số dư chờ xử lý"
          amount={balance?.pendingBalanceCents || 0}
          icon={Clock}
          iconColor="text-orange-600 dark:text-orange-400"
          description="Đang chờ xác nhận"
          loading={loading}
        />
      </div>

      <TotalBalanceCard
        available={balance?.availableBalanceCents}
        pending={balance?.pendingBalanceCents}
        loading={loading}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Lịch sử giao dịch
          </CardTitle>
          <CardDescription>
            {meta ? `${meta.total} giao dịch` : "Các giao dịch gần đây"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <TransactionsSkeleton />
          ) : transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
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

      <BankAccountDialog
        open={bankAccountDialogOpen}
        onOpenChange={setBankAccountDialogOpen}
      />
    </div>
  );
}
