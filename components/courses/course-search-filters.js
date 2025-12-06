"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function CourseSearchFilters({ onSearch, sortBy, onSortChange }) {
  const [searchInput, setSearchInput] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchInput)
    }, 1500)

    return () => clearTimeout(timer)
  }, [searchInput])

  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Tìm kiếm khóa học..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt,desc">Mới nhất</SelectItem>
          <SelectItem value="createdAt,asc">Cũ nhất</SelectItem>
          <SelectItem value="title,asc">Tên A-Z</SelectItem>
          <SelectItem value="title,desc">Tên Z-A</SelectItem>
          <SelectItem value="rating,desc">Đánh giá từ cao đến thấp</SelectItem>
          <SelectItem value="rating,asc">Đánh giá thấp đên cao</SelectItem>
          <SelectItem value="totalReviews,asc">Lượt đánh giá thấp đên cao</SelectItem>
          <SelectItem value="totalReviews,desc">Lượt dánh giá từ cao đến thấp</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
