"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CategoryForm({ initial, onSubmit, submitting }) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");

  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSubmit({ name, slug, description }); }}>
      <div className="grid gap-1">
        <label className="text-sm font-medium">Tên</label>
        <Input value={name} onChange={e=>setName(e.target.value)} required />
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium">Slug (tùy chọn)</label>
        <Input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="vd: toeic-tips" />
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium">Mô tả</label>
        <Textarea value={description} onChange={e=>setDescription(e.target.value)} />
      </div>
      <Button type="submit" disabled={submitting}>{submitting ? "Đang lưu..." : "Lưu"}</Button>
    </form>
  );
}