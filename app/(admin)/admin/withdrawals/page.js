"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, AlertCircle, Filter, Wallet, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getAdminWithdrawals, processWithdrawal } from "@/lib/api/admin";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_CONFIG = {
  PENDING: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800", icon: Clock },
  APPROVED: { label: "Đã duyệt", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: CheckCircle },
  PROCESSING: { label: "Đang xử lý", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: AlertCircle },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800", icon: CheckCircle },
  REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800", icon: XCircle },
  FAILED: { label: "Thất bại", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800", icon: XCircle },
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "FAILED", label: "Thất bại" },
];

const PageHeader = memo(function PageHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
        <Wallet className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Quản lý yêu cầu rút tiền</h1>
        <p className="text-sm text-muted-foreground hidden sm:block">
          Xem và xử lý các yêu cầu rút tiền của giảng viên
        </p>
      </div>
    </div>
  );
});

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 border rounded-lg">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8" />
            </div>
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
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Không có yêu cầu rút tiền</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Chưa có yêu cầu rút tiền nào phù hợp với bộ lọc hiện tại
      </p>
    </div>
  );
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const pageSize = 20;

  const fetchWithdrawals = useCallback(async (pageNum, status) => {
    setLoading(true);
    try {
      const result = await getAdminWithdrawals({
        state: status === "ALL" ? undefined : status,
        page: pageNum,
        size: pageSize,
      });
      if (result.success) {
        setWithdrawals(result.data.result);
        setMeta(result.data.meta);
        setPage(pageNum);
      } else {
        toast.error(result.error || "Không thể tải danh sách yêu cầu rút tiền");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi tải danh sách yêu cầu rút tiền");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchWithdrawals(1, statusFilter);
  }, [statusFilter, fetchWithdrawals]);

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      fetchWithdrawals(page - 1, statusFilter);
    }
  }, [page, statusFilter, fetchWithdrawals]);

  const handleNextPage = useCallback(() => {
    if (meta && page < meta.pages) {
      fetchWithdrawals(page + 1, statusFilter);
    }
  }, [meta, page, statusFilter, fetchWithdrawals]);

  const parseBankInfo = useCallback((bankInfoJson) => {
    try {
      return JSON.parse(bankInfoJson);
    } catch {
      return null;
    }
  }, []);

  const handleOpenProcessDialog = useCallback((withdrawal, status) => {
    setSelectedWithdrawal(withdrawal);
    setSelectedStatus(status);
    setAdminNote("");
    setProcessDialogOpen(true);
  }, []);

  const handleProcessWithdrawal = useCallback(async () => {
    if (!selectedWithdrawal || !selectedStatus) return;

    setProcessing(true);
    try {
      const result = await processWithdrawal(selectedWithdrawal.id, selectedStatus, adminNote);
      if (result.success) {
        toast.success("Xử lý yêu cầu rút tiền thành công");
        setProcessDialogOpen(false);
        setSelectedWithdrawal(null);
        setSelectedStatus("");
        setAdminNote("");
        await fetchWithdrawals(page, statusFilter);
      } else {
        toast.error(result.error || "Không thể xử lý yêu cầu rút tiền");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi xử lý yêu cầu rút tiền");
    } finally {
      setProcessing(false);
    }
  }, [selectedWithdrawal, selectedStatus, adminNote, page, statusFilter, fetchWithdrawals]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader />

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <span className="font-medium text-sm">Bộ lọc:</span>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
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
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách yêu cầu rút tiền</CardTitle>
          <CardDescription>
            {!loading && `${withdrawals.length} yêu cầu`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton />
          ) : withdrawals.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Giảng viên
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Số tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">
                      Tỷ giá
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">
                      PayPal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {withdrawals.map((withdrawal) => {
                    const statusConfig = STATUS_CONFIG[withdrawal.status] || STATUS_CONFIG.PENDING;
                    const StatusIcon = statusConfig.icon;
                    const bankInfo = parseBankInfo(withdrawal.bankInfoJson);

                    return (
                      <tr key={withdrawal.id} className="hover:bg-muted/50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-sm">{withdrawal.instructorName}</p>
                            <p className="text-xs text-muted-foreground">{withdrawal.instructorEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-sm">{withdrawal.amountFormatted}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(withdrawal.originalAmountCents).toLocaleString()} {withdrawal.originalCurrency}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <p className="text-xs text-muted-foreground">
                            1 {withdrawal.originalCurrency} = {withdrawal.exchangeRate} USD
                          </p>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <p className="text-xs font-mono">{bankInfo?.paypalEmail || "N/A"}</p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className={`${statusConfig.color} border`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(withdrawal.createdAt), "dd/MM/yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              {format(new Date(withdrawal.createdAt), "HH:mm")}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-1">
                            {withdrawal.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleOpenProcessDialog(withdrawal, "APPROVED")}
                                  className="bg-green-600 hover:bg-green-700 h-7 px-2 text-xs"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleOpenProcessDialog(withdrawal, "REJECTED")}
                                  className="h-7 px-2 text-xs"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {withdrawal.status === "APPROVED" && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleOpenProcessDialog(withdrawal, "COMPLETED")}
                                className="bg-blue-600 hover:bg-blue-700 h-7 px-2 text-xs"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-center sm:justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground hidden sm:block">
            Trang {page} / {meta.pages} • Tổng {meta.total} yêu cầu
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Trước</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page === meta.pages}
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedStatus === "APPROVED" && "Duyệt yêu cầu rút tiền"}
              {selectedStatus === "REJECTED" && "Từ chối yêu cầu rút tiền"}
              {selectedStatus === "COMPLETED" && "Hoàn thành yêu cầu rút tiền"}
            </DialogTitle>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Giảng viên:</span>
                    <span className="text-sm">{selectedWithdrawal.instructorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Số tiền:</span>
                    <span className="text-sm font-semibold">
                      {selectedWithdrawal.amountFormatted} ({Math.round(selectedWithdrawal.originalAmountCents).toLocaleString()} {selectedWithdrawal.originalCurrency})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">PayPal:</span>
                    <span className="text-sm font-mono">{parseBankInfo(selectedWithdrawal.bankInfoJson)?.paypalEmail || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNote">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="adminNote"
                  placeholder="Nhập ghi chú cho yêu cầu này..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                  disabled={processing}
                />
              </div>

              {selectedStatus === "REJECTED" && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Cảnh báo:</strong> Yêu cầu rút tiền sẽ bị từ chối và không thể hoàn tác.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProcessDialogOpen(false)}
              disabled={processing}
            >
              Hủy
            </Button>
            <Button
              onClick={handleProcessWithdrawal}
              disabled={processing}
              className={
                selectedStatus === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700"
                  : selectedStatus === "APPROVED"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {processing ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
