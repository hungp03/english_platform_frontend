"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import useDebouncedValue from "@/hooks/use-debounced-value";
import { ArrowUpDown } from "lucide-react";

export default function ThreadListFilters({ categories = [], onChange }) {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [locked, setLocked] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  
  const debouncedKeyword = useDebouncedValue(keyword, 1500);

  useEffect(() => {
    const params = {};
    if (debouncedKeyword.trim()) params.keyword = debouncedKeyword.trim();
    if (categoryId !== "all") params.categoryId = categoryId;
    if (locked !== "all") params.locked = locked === "true";
    
    // Thêm tham số sắp xếp
    params.sortBy = sortBy;
    params.sortDirection = sortDirection;
    
    onChange?.(params);
  }, [debouncedKeyword, categoryId, locked, sortBy, sortDirection]);

  const handleReset = () => {
    setKeyword("");
    setCategoryId("all");
    setLocked("all");
    setSortBy("createdAt");
    setSortDirection("desc");
  };

  return (
    <div className="space-y-3">
      {/* Hàng 1: Tìm kiếm */}
      <div className="flex flex-col md:flex-row gap-2">
        <Input 
          placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..." 
          value={keyword} 
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Hàng 2: Bộ lọc */}
      <div className="flex flex-col md:flex-row gap-2 flex-wrap">
        {/* Danh mục */}
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Trạng thái */}
        <Select value={locked} onValueChange={setLocked}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="false">Đang mở</SelectItem>
            <SelectItem value="true">Đã khóa</SelectItem>
          </SelectContent>
        </Select>

        {/* Sắp xếp theo */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Thời gian tạo</SelectItem>
            <SelectItem value="lastPostAt">Bài viết mới nhất</SelectItem>
            <SelectItem value="viewCount">Lượt xem</SelectItem>
            <SelectItem value="replyCount">Số bình luận</SelectItem>
          </SelectContent>
        </Select>

        {/* Thứ tự sắp xếp */}
        <Select value={sortDirection} onValueChange={setSortDirection}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Thứ tự" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <span>Giảm dần</span>
              </div>
            </SelectItem>
            <SelectItem value="asc">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <span>Tăng dần</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Nút xóa bộ lọc */}
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="w-full md:w-auto"
        >
          Xóa lọc
        </Button>
      </div>

      {/* Thông tin sắp xếp hiện tại */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Đang sắp xếp theo:</span>
        <span className="font-medium text-foreground">
          {sortBy === "createdAt" && "Thời gian tạo"}
          {sortBy === "lastPostAt" && "Bài viết mới nhất"}
          {sortBy === "viewCount" && "Lượt xem"}
          {sortBy === "replyCount" && "Số bình luận"}
        </span>
        <span>•</span>
        <span className="font-medium text-foreground">
          {sortDirection === "desc" ? "Giảm dần" : "Tăng dần"}
        </span>
      </div>
    </div>
  );
}