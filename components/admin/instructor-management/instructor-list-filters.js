import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const InstructorListFilters = ({ search, onSearchChange, sortField, onSortFieldChange, sortDir, onSortDirToggle }) => {
  return (
    <div className="flex gap-4 items-end mb-6">
      <div className="flex-1 max-w-sm">
        <Label htmlFor="instructor-search" className="mb-1">Tìm kiếm</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="instructor-search"
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-48">
        <Label htmlFor="sort-field" className="mb-1">Sắp xếp theo</Label>
        <Select value={sortField} onValueChange={onSortFieldChange}>
          <SelectTrigger id="sort-field">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fullName">Tên giảng viên</SelectItem>
            <SelectItem value="createdAt">Ngày tham gia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onSortDirToggle}
        className="flex items-center gap-2"
      >
        <ArrowUpDown className="h-4 w-4" />
        {sortDir === "asc" ? "Tăng dần" : "Giảm dần"}
      </Button>
    </div>
  );
};

export default InstructorListFilters;
