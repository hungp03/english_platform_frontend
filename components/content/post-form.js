"use client";
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogPostCreateSchema, blogPostUpdateSchema } from "@/schema/blog";
import { Input } from "@/components/ui/input";
import Editor from "@/components/content/editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function PostForm({
  initial,
  categories,
  onSubmit,
  submitting,
}) {
  const isEdit = !!initial;
  const schema = isEdit ? blogPostUpdateSchema : blogPostCreateSchema;
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title || "",
      slug: initial?.slug || "",
      bodyMd: initial?.bodyMd || "",
      categoryIds: initial?.categories?.map((c) => c.id) || [],
    },
  });

  const categoryIds = watch("categoryIds");

  useEffect(() => {
    if (initial) {
      reset({
        title: initial.title || "",
        slug: initial.slug || "",
        bodyMd: initial.bodyMd || "",
        categoryIds: initial.categories?.map((c) => c.id) || [],
      });
    }
  }, [initial, reset]);

  function toggleCat(id) {
    const current = categoryIds || [];
    const updated = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    setValue("categoryIds", updated);
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-1">
        <label className="text-sm font-medium">Tiêu đề</label>
        <Input {...register("title")} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      
      <div className="grid gap-1">
        <label className="text-sm font-medium">Slug (tùy chọn)</label>
        <Input
          {...register("slug")}
          placeholder="vd: 10-meo-luyen-toeic"
        />
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>
      
      <div className="grid gap-1">
        <label className="text-sm font-medium">Nội dung</label>
        <Controller
          name="bodyMd"
          control={control}
          render={({ field }) => (
            <Editor
              initialContent={field.value}
              onContentChange={field.onChange}
              className="min-h-[24rem]"
            />
          )}
        />
        {errors.bodyMd && (
          <p className="text-sm text-destructive">{errors.bodyMd.message}</p>
        )}
      </div>
      
      <div className="grid gap-1">
        <label className="text-sm font-medium">Danh mục</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2">
              <Checkbox
                checked={categoryIds?.includes(c.id)}
                onCheckedChange={() => toggleCat(c.id)}
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
        {errors.categoryIds && (
          <p className="text-sm text-destructive">{errors.categoryIds.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={submitting}>
        {submitting ? "Đang lưu..." : "Lưu"}
      </Button>
    </form>
  );
}
