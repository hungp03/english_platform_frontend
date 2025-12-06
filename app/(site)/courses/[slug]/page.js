"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FullPageLoader } from "@/components/ui/full-page-loader"
import { getCourseBySlug } from "@/lib/api/course"
import { useEnrollmentStore } from "@/store/enrollment-store"
import { useAuthStore } from "@/store/auth-store"
import CourseReviews from "@/components/reviews/course-review"
import {
  CourseHeader,
  CourseInfo,
  CourseDescription,
  CoursePurchase,
  CourseModules,
} from "@/components/courses/detail"

export default function CourseDetailPage() {
  const params = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Auth and enrollment stores - use selectors to avoid unnecessary re-renders
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const enrollments = useEnrollmentStore((state) => state.enrollments)
  const fetchEnrollments = useEnrollmentStore((state) => state.fetchEnrollments)

  // Memoize enrollment check to prevent recalculation on every render
  const isEnrolled = useMemo(() => {
    if (!course?.id) return false
    return enrollments.some((enrollment) => enrollment.courseId === course.id)
  }, [enrollments, course?.id])

  // Memoize fetchCourse to prevent recreation on every render
  const fetchCourse = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await getCourseBySlug(params.slug)

    if (result.success) {
      setCourse(result.data)
    } else {
      setError(result.error || "Không thể tải thông tin khóa học")
    }

    setLoading(false)
  }, [params.slug])

  useEffect(() => {
    if (params.slug) {
      fetchCourse()
    }
  }, [params.slug, fetchCourse])

  useEffect(() => {
    // Fetch enrollments when user is logged in and not already fetched
    if (isLoggedIn && enrollments.length === 0) {
      fetchEnrollments()
    }
  }, [isLoggedIn, fetchEnrollments, enrollments.length])

  if (loading) {
    return <FullPageLoader />
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              {error || "Không tìm thấy khóa học"}
            </p>
            <Button asChild>
              <Link href="/courses">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách khóa học
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/courses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
        </Button>

        {/* Course Header */}
        <CourseHeader course={course} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Info, Description, and Modules */}
          <div className="lg:col-span-2 space-y-8">
            <CourseInfo course={course} />
            <CourseDescription course={course} />
            <CourseModules courseId={course.id} />
          </div>

          {/* Right Column - Purchase Section */}
          <div className="lg:col-span-1">
            <CoursePurchase course={course} isEnrolled={isEnrolled} />
          </div>
        </div>
        <div className="mt-16 max-w-4xl mx-auto">
            <CourseReviews courseId={course.id} />
        </div>
      </div>
    </div>
  )
}

