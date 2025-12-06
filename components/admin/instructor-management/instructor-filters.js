"use client";

import React from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const InstructorFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortDir,
  onSortToggle,
  onStatusFilter
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-8 items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Tìm kiếm theo tên, email hoặc bằng cấp..."
          className="pl-10"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Chọn trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="PENDING">Chờ duyệt</SelectItem>
          <SelectItem value="APPROVED">Đã duyệt</SelectItem>
          <SelectItem value="REJECTED">Đã từ chối</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onSortToggle}>
        <ArrowUpDown className="w-4 h-4 mr-2" />
        Thời gian ({sortDir.toUpperCase()})
      </Button>
    </div>
  );
};

export default InstructorFilters;