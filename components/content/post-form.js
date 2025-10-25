"use client";
import React, { useEffect, useState } from "react";
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
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [bodyMd, setBodyMd] = useState(initial?.bodyMd || "");
  const [categoryIds, setCategoryIds] = useState(
    initial?.categories?.map((c) => c.id) || []
  );

  // >>> NEW: đồng bộ lại khi initial đổi (fetch async)
  useEffect(() => {
    setTitle(initial?.title || "");
    setSlug(initial?.slug || "");
    setBodyMd(initial?.bodyMd || "");
    setCategoryIds(initial?.categories?.map((c) => c.id) || []);
  }, [initial]);

  function toggleCat(id) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, slug, bodyMd, categoryIds });
      }}
    >
      <div className="grid gap-1">
        <label className="text-sm font-medium">Tiêu đề</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium">Slug (tùy chọn)</label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="vd: 10-meo-luyen-toeic"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium">Nội dung</label>
        <Editor
          initialContent={bodyMd}
          onContentChange={(val) => setBodyMd(val)}
          className="min-h-[24rem]"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium">Danh mục</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2">
              <Checkbox
                checked={categoryIds.includes(c.id)}
                onCheckedChange={() => toggleCat(c.id)}
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Đang lưu..." : "Lưu"}
      </Button>
    </form>
  );
}
