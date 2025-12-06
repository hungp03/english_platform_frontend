"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getAllCourses, changeCourseStatus } from "@/lib/api/course"
import { Pagination } from "@/components/ui/pagination"
import { toast } from "sonner"
import CoursesHeader from "@/components/admin/courses/courses-header"
import CourseFilters from "@/components/admin/courses/course-filters"
import CourseTable from "@/components/admin/courses/course-table"

const PAGE_SIZE = 10

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    pages: 0,
    total: 0,
  })
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    skills: "ALL",
    sort: "createdAt,desc",
  })
  const [searchInput, setSearchInput] = useState("")
  
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const fetchCourses = useCallback(async (page = 1, overrideFilters = null) => {
    setLoading(true)
    try {
      const currentFilters = overrideFilters || filtersRef.current
      const params = {
        page,
        size: PAGE_SIZE,
        sort: currentFilters.sort || "createdAt,desc",
      }

      if (currentFilters.keyword) params.keyword = currentFilters.keyword
      if (currentFilters.status) params.status = currentFilters.status
      if (currentFilters.skills && currentFilters.skills !== "ALL")
        params.skills = [currentFilters.skills]

      const response = await getAllCourses(params)

      if (response.success) {
        setCourses(response.data.result || [])
        setPagination({
          page: response.data.meta?.page || 1,
          pageSize: response.data.meta?.pageSize || PAGE_SIZE,
          pages: response.data.meta?.pages || 0,
          total: response.data.meta?.total || 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleSearchInputChange = useCallback((value) => {
    setSearchInput(value)
  }, [])

  const handleSearch = useCallback(() => {
    setFilters(prev => {
      const newFilters = { ...prev, keyword: searchInput }
      fetchCourses(1, newFilters)
      return newFilters
    })
  }, [searchInput, fetchCourses])

  const handleStatusFilter = useCallback((status) => {
    const actualStatus = status === "ALL" ? "" : status
    setFilters(prev => {
      const newFilters = { ...prev, status: actualStatus }
      fetchCourses(1, newFilters)
      return newFilters
    })
  }, [fetchCourses])

  const handleSkillsFilter = useCallback((skills) => {
    const actualSkills = skills === "ALL" ? "" : skills
    setFilters(prev => {
      const newFilters = { ...prev, skills: actualSkills }
      fetchCourses(1, newFilters)
      return newFilters
    })
  }, [fetchCourses])

  const handleSortChange = useCallback((sort) => {
    setFilters(prev => {
      const newFilters = { ...prev, sort }
      fetchCourses(1, newFilters)
      return newFilters
    })
  }, [fetchCourses])

  const handlePageChange = useCallback((page) => {
    fetchCourses(page)
  }, [fetchCourses])

  const handleStatusUpdate = useCallback(async (courseId, newStatus) => {
    try {
      const response = await changeCourseStatus(courseId, newStatus)
      if (response.success) {
        toast.success("Cập nhật trạng thái khóa học thành công")
        fetchCourses(pagination.page)
      } else {
        toast.error(response.error || "Không thể cập nhật trạng thái khóa học")
      }
    } catch (error) {
      console.error("Failed to update course status:", error)
      toast.error("Không thể cập nhật trạng thái khóa học")
    }
  }, [fetchCourses, pagination.page])

  return (
    <div className="p-6 space-y-6">
      <CoursesHeader />

      <CourseFilters
        searchInput={searchInput}
        onSearchInputChange={handleSearchInputChange}
        statusFilter={filters.status || "ALL"}
        onStatusFilterChange={handleStatusFilter}
        skillsFilter={filters.skills || "ALL"}
        onSkillsFilterChange={handleSkillsFilter}
        sortBy={filters.sort}
        onSortChange={handleSortChange}
        onSearch={handleSearch}
      />

      <CourseTable
        courses={courses}
        loading={loading}
        onStatusUpdate={handleStatusUpdate}
      />

      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <Pagination
            totalPages={pagination.pages}
            currentPage={pagination.page}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}
