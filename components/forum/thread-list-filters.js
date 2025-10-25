"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import useDebouncedValue from "@/hooks/useDebouncedValue";

export default function ThreadListFilters({ categories = [], onChange }) {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [locked, setLocked] = useState("all");
  const debouncedKeyword = useDebouncedValue(keyword, 1500);

  useEffect(() => {
    const params = {};
    if (debouncedKeyword.trim()) params.keyword = debouncedKeyword.trim();
    if (categoryId !== "all") params.categoryId = categoryId;
    if (locked !== "all") params.locked = locked === "true";
    onChange?.(params);
  }, [debouncedKeyword, categoryId, locked]);

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <Input placeholder="Từ khóa..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <Select value={categoryId} onValueChange={setCategoryId}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả danh mục</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={locked} onValueChange={setLocked}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="false">Đang mở</SelectItem>
          <SelectItem value="true">Đã khóa</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={() => { setKeyword(""); setCategoryId("all"); setLocked("all"); }}>
        Xóa lọc
      </Button>
    </div>
  );
}
