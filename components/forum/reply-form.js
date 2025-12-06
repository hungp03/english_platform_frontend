"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { replyToThread } from "@/lib/api/forum";
import { postCreateSchema } from "@/schema/forum";

export default function ReplyForm({ threadId, onDone }) {
  const form = useForm({
    resolver: zodResolver(postCreateSchema),
    defaultValues: {
      bodyMd: ""
    }
  });

  const { control, handleSubmit, reset, formState: { isSubmitting } } = form;

  async function onSubmit(data) {
    try {
      const result = await replyToThread(threadId, data);
      if (result.success) {
        reset();
        toast.success("Gửi phản hồi thành công!");
        onDone?.();
      } else {
        toast.error(result.error || "Không thể gửi phản hồi");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể gửi phản hồi");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={control}
          name="bodyMd"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea 
                  rows={4} 
                  placeholder="Viết phản hồi..." 
                  maxLength={10000}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
