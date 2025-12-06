"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReviewFilters({ filters, onChange }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Lọc theo trạng thái */}
      <div className="w-[180px]">
        <Select
          value={filters.isPublished}
          onValueChange={(val) => onChange("isPublished", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="true">Công khai</SelectItem>
            <SelectItem value="false">Đã ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lọc theo số sao */}
      <div className="w-[180px]">
        <Select
          value={filters.rating}
          onValueChange={(val) => onChange("rating", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Số sao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả sao</SelectItem>
            <SelectItem value="5">5 Sao</SelectItem>
            <SelectItem value="4">4 Sao</SelectItem>
            <SelectItem value="3">3 Sao</SelectItem>
            <SelectItem value="2">2 Sao</SelectItem>
            <SelectItem value="1">1 Sao</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}