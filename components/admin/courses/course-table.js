"use client"

import { memo, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { Eye, CheckCircle, XCircle, EyeOff, BookOpen } from "lucide-react"
import CourseTableHeader from "./course-table-header"
import CourseTableRow from "./course-table-row"

const SKELETON_COUNT = 5

const getStatusColor = (status) => {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    case 'PENDING_REVIEW':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'REJECTED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'UNPUBLISHED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'PUBLISHED':
      return 'Đã xuất bản'
    case 'DRAFT':
      return 'Nháp'
    case 'PENDING_REVIEW':
      return 'Chờ phê duyệt'
    case 'REJECTED':
      return 'Từ chối'
    case 'UNPUBLISHED':
      return 'Tạm ẩn'
    default:
      return status
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const canApprove = (course) => {
  return course.status === 'PENDING_REVIEW'
}

const canReject = (course) => {
  return course.status === 'PENDING_REVIEW' || course.status === 'PUBLISHED'
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div key={index} className="border rounded-lg p-4 flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Không tìm thấy khóa học</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm khóa học phù hợp
      </p>
    </div>
  )
}

const MobileCard = memo(function MobileCard({ course, onStatusUpdate }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate mb-1" title={course.title}>
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2" title={course.description}>
            {course.description}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Badge className={`${getStatusColor(course.status)} text-xs`}>
            {getStatusLabel(course.status)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {course.skillFocus?.slice(0, 3).map((skill, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase()}
          </Badge>
        ))}
        {course.skillFocus?.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{course.skillFocus.length - 3}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-muted-foreground">Giá:</span>
          <div className="font-medium">
            {formatCurrency(course.priceCents, course.currency)}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Ngày tạo:</span>
          <div>{formatDate(course.createdAt)}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Chương:</span>
          <div>{course.moduleCount}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Bài học:</span>
          <div>{course.lessonCount}</div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2 border-t border-border">
        {course.status === 'PUBLISHED' && (
          <Link href={`/admin/courses/${course.slug}`}>
            <Button variant="ghost" size="sm" className="p-2 h-8 w-8" title="Xem chi tiết">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        )}

        {canApprove(course) && (
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            onClick={() => onStatusUpdate(course.id, 'PUBLISHED')}
            title="Phê duyệt"
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
        )}

        {canReject(course) && (
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => onStatusUpdate(course.id, 'REJECTED')}
            title="Từ chối"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        )}

        {course.status === 'PUBLISHED' && (
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
            onClick={() => onStatusUpdate(course.id, 'UNPUBLISHED')}
            title="Gỡ xuất bản"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
})

const CourseTable = memo(function CourseTable({ courses, loading, onStatusUpdate }) {
  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <LoadingSkeleton />
        ) : courses.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="block md:hidden divide-y divide-border">
              {courses.map((course) => (
                <MobileCard key={course.id} course={course} onStatusUpdate={onStatusUpdate} />
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <CourseTableHeader />
                <tbody className="divide-y divide-border">
                  {courses.map((course) => (
                    <CourseTableRow
                      key={course.id}
                      course={course}
                      onStatusUpdate={onStatusUpdate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
})

export default CourseTable