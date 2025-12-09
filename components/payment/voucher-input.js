"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ticket, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { applyVoucher } from "@/lib/api/voucher";
import { toast } from "sonner";

export function VoucherInput({ onApply, onApplyDirect, onRemove, appliedVoucher, disabled }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApply = useCallback(async () => {
    if (!code.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      let result;
      
      // Use direct apply if provided (for single course checkout)
      if (onApplyDirect) {
        result = await onApplyDirect(code.trim());
      } else {
        // Use cart apply (for cart checkout)
        result = await applyVoucher(code.trim());
        if (result.success && result.data?.valid) {
          onApply?.(result.data);
        }
      }
      
      if (result.success && result.data?.valid) {
        setCode("");
        toast.success("Áp dụng voucher thành công!");
      } else {
        const errorMsg = result.data?.message || result.error || "Voucher không hợp lệ";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Apply voucher error:", err);
      setError("Đã xảy ra lỗi khi áp dụng voucher");
    } finally {
      setLoading(false);
    }
  }, [code, loading, onApply, onApplyDirect]);

  const handleRemove = useCallback(() => {
    onRemove?.();
    setError(null);
  }, [onRemove]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  }, [handleApply]);

  // If voucher is applied, show applied state
  if (appliedVoucher) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Ticket className="h-4 w-4" />
          Mã giảm giá
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="font-mono font-semibold text-green-700 dark:text-green-400">
              {appliedVoucher.code}
            </span>
            <Badge variant="secondary" className="text-xs">
              {appliedVoucher.discountType === "PERCENTAGE"
                ? `-${appliedVoucher.discountValue}%`
                : `-${Number(appliedVoucher.discountValue).toLocaleString()}đ`}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {appliedVoucher.totalDiscount > 0 && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Bạn được giảm: -{Number(appliedVoucher.totalDiscount).toLocaleString()}đ
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Ticket className="h-4 w-4" />
        Mã giảm giá
      </div>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          onKeyPress={handleKeyPress}
          placeholder="Nhập mã voucher"
          disabled={disabled || loading}
          className={`flex-1 font-mono uppercase ${error ? "border-red-500" : ""}`}
        />
        <Button
          onClick={handleApply}
          disabled={disabled || loading || !code.trim()}
          variant="outline"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Áp dụng"
          )}
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
