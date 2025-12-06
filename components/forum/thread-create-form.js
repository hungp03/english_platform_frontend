"use client";
import { toast } from 'sonner';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getForumCategories, createThread } from "@/lib/api/forum";
import Editor from "@/components/content/editor";
import { threadCreateSchema } from "@/schema/forum";

export default function ThreadCreateForm() {
  const router = useRouter();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(threadCreateSchema),
    defaultValues: {
      title: "",
      bodyMd: "",
      categoryIds: []
    }
  });

  const { control, handleSubmit, formState: { errors }, setValue, watch } = form;
  const categoryIds = watch("categoryIds");
  const title = watch("title");

  useEffect(() => {
    async function loadCategories() {
      const result = await getForumCategories();
      if (result.success) {
        setCats(result.data);
      } else {
        toast.error(result.error || "Không thể tải danh mục");
      }
    }
    loadCategories();
  }, []);

  function toggleCat(id) {
    const current = categoryIds || [];
    const newValue = current.includes(id) 
      ? current.filter((x) => x !== id) 
      : [...current, id];
    setValue("categoryIds", newValue, { shouldValidate: true });
  }

  async function onSubmit(data) {
    setLoading(true);
    try {
      const result = await createThread(data);
      if (result.success) {
        toast.success("Tạo chủ đề thành công!");
        if (result.data?.slug) {
          router.push(`/forum/${result.data.slug}`);
        } else {
          router.push("/forum");
        }
      } else {
        toast.error(result.error || "Không thể tạo chủ đề");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tạo chủ đề");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo chủ đề mới</CardTitle>
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
                    {cats.length === 0 && (
                      <span className="text-xs text-muted-foreground col-span-full">
                        Chưa có danh mục forum.
                      </span>
                    )}
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
                          initialContent=""
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
                onClick={() => router.push("/forum")}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo chủ đề"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
