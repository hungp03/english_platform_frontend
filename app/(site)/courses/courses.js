"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Pagination } from "@/components/ui/pagination"
import { getPublishedCourses } from "@/lib/api/course"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CoursesHeader,
  SkillFilters,
  CoursesGrid,
  EmptyState,
  CourseSearchFilters,
} from "@/components/courses"

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [sortBy, setSortBy] = useState("createdAt,desc")
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    pages: 0,
    total: 0,
  })

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    const params = {
      page: pagination.page,
      size: 12,
      sort: sortBy,
    }
    
    if (selectedSkills.length > 0) params.skills = selectedSkills
    if (searchKeyword) params.keyword = searchKeyword

    const result = await getPublishedCourses(params)

    if (result.success) {
      setCourses(result.data.result || [])
      setPagination({
        page: result.data.meta.page,
        pageSize: result.data.meta.pageSize,
        pages: result.data.meta.pages,
        total: result.data.meta.total,
      })
    }
    setLoading(false)
  }, [pagination.page, sortBy, selectedSkills, searchKeyword])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleSkillToggle = useCallback((skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    )
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handleClearAllSkills = useCallback(() => {
    setSelectedSkills([])
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handleSearch = useCallback((keyword) => {
    setSearchKeyword(keyword)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handleSortChange = useCallback((sort) => {
    setSortBy(sort)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <CoursesHeader />

        <CourseSearchFilters
          onSearch={handleSearch}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        <SkillFilters
          selectedSkills={selectedSkills}
          onSkillToggle={handleSkillToggle}
          onClearAll={handleClearAllSkills}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <CoursesGrid courses={courses} />

            {pagination.pages > 1 && (
              <div className="mt-8">
                <Pagination
                  totalPages={pagination.pages}
                  currentPage={pagination.page}
                  onPageChange={handlePageChange}
                  siblingCount={1}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
