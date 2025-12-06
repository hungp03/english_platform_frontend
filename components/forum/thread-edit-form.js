"use client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getForumCategories, updateThread, getForumThreadBySlug } from "@/lib/api/forum";
import Editor from "@/components/content/editor";
import { useAuthStore } from "@/store/auth-store";
import { threadUpdateSchema } from "@/schema/forum";

export default function ThreadEditForm({ slug }) {
  const router = useRouter();

  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [noPermission, setNoPermission] = useState(false);

  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const form = useForm({
    resolver: zodResolver(threadUpdateSchema),
    defaultValues: {
      title: "",
      bodyMd: "",
      categoryIds: []
    }
  });

  const { control, handleSubmit, setValue, watch, reset } = form;
  const categoryIds = watch("categoryIds");
  const title = watch("title");

  useEffect(() => {
    if (!hasHydrated) return;

    async function init() {
      try {
        const [catsResult, threadResult] = await Promise.all([
          getForumCategories(),
          getForumThreadBySlug(slug),
        ]);

        if (catsResult.success) {
          setCats(catsResult.data);
        }

        if (threadResult.success && threadResult.data) {
          const threadData = threadResult.data;
          if (!user) {
            setNoPermission(true);
            return;
          }

          if (String(threadData.authorId) !== String(user.id)) {
            setNoPermission(true);
            return;
          }

          setThreadId(threadData.id);
          
          // Reset form with loaded data
          reset({
            title: threadData.title || "",
            bodyMd: threadData.bodyMd || "",
            categoryIds: threadData.categories?.map((c) => c.id) || []
          });
        } else {
          toast.error(threadResult.error || "Không thể tải thông tin bài viết");
        }
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải thông tin bài viết");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [slug, user, hasHydrated, reset]);

  function toggleCat(id) {
    const current = categoryIds || [];
    const newValue = current.includes(id) 
      ? current.filter((x) => x !== id) 
      : [...current, id];
    setValue("categoryIds", newValue, { shouldValidate: true });
  }

  async function onSubmit(data) {
    setSubmitting(true);
    try {
      const result = await updateThread(threadId, data);
      if (result.success) {
        toast.success("Cập nhật bài viết thành công!");
        router.push(`/forum/${result.data.slug}`);
      } else {
        toast.error(result.error || "Cập nhật thất bại");
      }
    } catch (e) {
      console.error(e);
      toast.error("Cập nhật thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div>Đang tải dữ liệu...</div>;

  if (noPermission) {
    return (
      <Card className="p-6 border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">
            Bạn không có quyền chỉnh sửa bài viết này
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700 mb-4">
            Chỉ tác giả bài viết mới có thể chỉnh sửa nội dung.
          </p>
          <Button onClick={() => router.push(`/forum/${slug}`)}>
            Quay lại bài viết
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chỉnh sửa chủ đề</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tiêu đề <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tiêu đề chủ đề..."
                      {...field}
                      maxLength={255}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {(title || "").length}/255 ký tự
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Danh mục <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {cats.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          checked={(categoryIds || []).includes(c.id)}
                          onChange={() => toggleCat(c.id)}
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                  {(categoryIds || []).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Đã chọn {categoryIds.length} danh mục
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="bodyMd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nội dung <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Controller
                      control={control}
                      name="bodyMd"
                      render={({ field }) => (
                        <Editor
                          key={loading ? "loading" : "loaded"}
                          initialContent={field.value}
                          onContentChange={(content) => field.onChange(content)}
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => router.back()} 
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}