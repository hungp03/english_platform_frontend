
"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { replyToPost } from "@/lib/api/forum";
import { postReplySchema } from "@/schema/forum";

/**
 * Inline form to reply to a top-level comment (level-1) and create a level-2 comment.
 * It intentionally does NOT support deeper nesting.
 */
export default function ReplyToPostForm({ threadId, parentPostId, onDone }) {
  const form = useForm({
    resolver: zodResolver(postReplySchema),
    defaultValues: {
      bodyMd: ""
    }
  });

  const { control, handleSubmit, reset, formState: { isSubmitting } } = form;

  async function onSubmit(data) {
    try {
      const result = await replyToPost(threadId, parentPostId, data);
      if (result.success) {
        reset();
        toast.success("Gửi trả lời thành công!");
        onDone?.();
      } else {
        toast.error(result.error || "Không thể gửi trả lời");
      }
    } catch (e) {
      console.error(e);
      toast.error("Không thể gửi trả lời. Vui lòng thử lại.");
    }
  }

  function handleCancel() {
    reset();
    onDone?.();
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
                  rows={3}
                  placeholder="Viết trả lời..."
                  maxLength={10000}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleCancel} 
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi trả lời"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
