"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ReportDialog({
  open,
  onOpenChange,
  target,            // { type: "post" | "thread", id: string }
  onSubmit,          // async (reason) => void
  loading = false,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const canSubmit = reason.trim().length >= 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Báo cáo {target?.type === "post" ? "phản hồi" : "chủ đề"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Hãy mô tả ngắn gọn lý do bạn muốn báo cáo nội dung này (tối thiểu 5 ký tự).
          </p>
          <Textarea
            autoFocus
            rows={5}
            placeholder="Ví dụ: Nội dung mang tính công kích/cá nhân…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={() => onSubmit?.(reason.trim())} disabled={!canSubmit || loading}>
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
