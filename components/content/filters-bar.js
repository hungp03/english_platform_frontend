"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function FiltersBar({ categories, onChange, initial = {} }) {
  const [keyword, setKeyword] = useState(initial.keyword || "");
  const [categoryId, setCategoryId] = useState(initial.categoryId || "all");

  useEffect(() => {
    // Chỉ gửi categoryId nếu không phải "all"
    const filters = {};
    if (keyword.trim()) {
      filters.keyword = keyword;
    }
    if (categoryId !== "all") {
      filters.categoryId = categoryId;
    }
    onChange(filters);
  }, [keyword, categoryId, onChange]);

  function handleReset() {
    setKeyword("");
    setCategoryId("all");
  }

  return (
    <div className="flex flex-col md:flex-row gap-2 items-center">
      <Input
        placeholder="Tìm kiếm..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <Select value={categoryId} onValueChange={setCategoryId}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Danh mục" />
        </SelectTrigger>
        <SelectContent>
          {/* Sửa: dùng "all" thay vì "" */}
          <SelectItem value="all">Tất cả</SelectItem>
          {categories?.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={handleReset}>
        Xóa lọc
      </Button>
    </div>
  );
}
