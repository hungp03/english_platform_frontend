"use client"

import { memo, useCallback, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ArrowUpDown, Sparkles } from "lucide-react"
import { getAllSkills } from "@/lib/api/skill"

const CourseFilters = memo(function CourseFilters({
  searchInput,
  onSearchInputChange,
  statusFilter,
  onStatusFilterChange,
  skillsFilter,
  onSkillsFilterChange,
  sortBy,
  onSortChange,
  onSearch,
  skills,
  onSkillsChange
}) {
  useEffect(() => {
    if (skills.length === 0) {
      const fetchSkills = async () => {
        try {
          const res = await getAllSkills()
          if (res.success && res.data) {
            onSkillsChange(res.data)
          }
        } catch (err) {
          console.error("Failed to fetch skills:", err)
        }
      }
      fetchSkills()
    }
  }, [skills.length, onSkillsChange])

  const handleInputChange = useCallback((e) => {
    onSearchInputChange(e.target.value)
  }, [onSearchInputChange])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') onSearch()
  }, [onSearch])

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Tìm kiếm khóa học..."
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-10"
        />
      </div>

      <Select value={statusFilter || "ALL"} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[160px]">
          <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
          <SelectItem value="PENDING_REVIEW">Chờ phê duyệt</SelectItem>
          <SelectItem value="REJECTED">Từ chối</SelectItem>
          <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
          <SelectItem value="UNPUBLISHED">Tạm ẩn</SelectItem>
        </SelectContent>
      </Select>

      <Select value={skillsFilter} onValueChange={onSkillsFilterChange}>
        <SelectTrigger className="w-[160px]">
          <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
          <SelectValue placeholder="Kỹ năng" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả kỹ năng</SelectItem>
          {skills.map((skill) => (
            <SelectItem key={skill.id} value={skill.name}>
              {skill.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <ArrowUpDown className="w-4 h-4 mr-2 flex-shrink-0" />
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt,desc">Mới nhất</SelectItem>
          <SelectItem value="createdAt,asc">Cũ nhất</SelectItem>
          <SelectItem value="title,asc">Tên A-Z</SelectItem>
          <SelectItem value="title,desc">Tên Z-A</SelectItem>
          <SelectItem value="priceCents,asc">Giá tăng dần</SelectItem>
          <SelectItem value="priceCents,desc">Giá giảm dần</SelectItem>
          <SelectItem value="moduleCount,desc">Nhiều bài học nhất</SelectItem>
          <SelectItem value="moduleCount,asc">Ít bài học nhất</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={onSearch} variant="default">
        <Search className="w-4 h-4 mr-2" />
        Tìm kiếm
      </Button>
    </div>
  )
})

export default CourseFilters