"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogCategoryCreateSchema, blogCategoryUpdateSchema } from "@/schema/blog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CategoryForm({ initial, onSubmit, submitting }) {
  const isEdit = !!initial;
  const schema = isEdit ? blogCategoryUpdateSchema : blogCategoryCreateSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name || "",
      slug: initial?.slug || "",
      description: initial?.description || "",
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name || "",
        slug: initial.slug || "",
        description: initial.description || "",
      });
    }
  }, [initial, reset]);

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-1">
        <label className="text-sm font-medium">Tên</label>
        <Input {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      
      <div className="grid gap-1">
        <label className="text-sm font-medium">Slug (tùy chọn)</label>
        <Input {...register("slug")} placeholder="vd: toeic-tips" />
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>
      
      <div className="grid gap-1">
        <label className="text-sm font-medium">Mô tả</label>
        <Textarea {...register("description")} />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={submitting}>
        {submitting ? "Đang lưu..." : "Lưu"}
      </Button>
    </form>
  );
}