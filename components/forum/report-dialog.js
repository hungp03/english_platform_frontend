"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { reportCreateSchema } from "@/schema/forum";

export default function ReportDialog({
  open,
  onOpenChange,
  target,            // { type: "post" | "thread", id: string }
  onSubmit,          // async (data) => void - receives { reason: string }
  loading = false,
}) {
  const form = useForm({
    resolver: zodResolver(reportCreateSchema),
    defaultValues: {
      reason: ""
    }
  });

  const { control, handleSubmit, reset, formState: { isSubmitting } } = form;

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  async function onFormSubmit(data) {
    await onSubmit?.(data.reason);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Báo cáo {target?.type === "post" ? "phản hồi" : "chủ đề"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Hãy mô tả ngắn gọn lý do bạn muốn báo cáo nội dung này (tối thiểu 10 ký tự).
              </p>
              <FormField
                control={control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        autoFocus
                        rows={5}
                        placeholder="Ví dụ: Nội dung mang tính công kích/cá nhân…"
                        maxLength={1000}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={loading || isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading || isSubmitting}>
                {loading || isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
