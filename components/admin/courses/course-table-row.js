"use client"

import { useState, memo, useCallback, useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Eye, CheckCircle, XCircle, EyeOff } from "lucide-react"
import CourseStatusConfirmDialog from "./course-status-confirm-dialog"

const STATUS_COLORS = {
  PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  UNPUBLISHED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
}

const STATUS_LABELS = {
  PUBLISHED: "Đã xuất bản",
  DRAFT: "Nháp",
  PENDING_REVIEW: "Chờ phê duyệt",
  REJECTED: "Từ chối",
  UNPUBLISHED: "Tạm ẩn",
}

const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.DRAFT
const getStatusLabel = (status) => STATUS_LABELS[status] || status
const formatDate = (dateString) => new Date(dateString).toLocaleDateString("vi-VN")

const CourseTableRow = memo(function CourseTableRow({ course, onStatusUpdate }) {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
  })

  const canApprove = course.status === "PENDING_REVIEW"
  const canReject = course.status === "PENDING_REVIEW" || course.status === "PUBLISHED"

  const handleApprove = useCallback(() => {
    setConfirmDialog({ open: true, action: "approve" })
  }, [])

  const handleReject = useCallback(() => {
    setConfirmDialog({ open: true, action: "reject" })
  }, [])

  const handleUnpublish = useCallback(() => {
    setConfirmDialog({ open: true, action: "unpublish" })
  }, [])

  const handleDialogOpenChange = useCallback((open) => {
    setConfirmDialog(prev => ({ ...prev, open }))
  }, [])

  const handleConfirmAction = useCallback(() => {
    if (!onStatusUpdate) return
    switch (confirmDialog.action) {
      case "approve":
        onStatusUpdate(course.id, "PUBLISHED")
        break
      case "reject":
        onStatusUpdate(course.id, "REJECTED")
        break
      case "unpublish":
        onStatusUpdate(course.id, "UNPUBLISHED")
        break
    }
  }, [onStatusUpdate, course.id, confirmDialog.action])

  return (
    <>
      <tr className="hover:bg-muted/50 transition-colors">
        <td className="px-4 py-4 align-top min-h-0">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-sm font-medium mb-1 line-clamp-1" title={course.title}>
              {course.title}
            </div>
            <div className="text-sm text-muted-foreground mb-2 line-clamp-2" title={course.description}>
              {course.description}
            </div>

            <div className="sm:hidden space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge className={`${getStatusColor(course.status)} text-xs flex-shrink-0 whitespace-nowrap`}>
                  {getStatusLabel(course.status)}
                </Badge>
                <div className="flex flex-wrap gap-1 flex-1 justify-end">
                  {course.skillFocus?.slice(0, 2).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase()}
                    </Badge>
                  ))}
                  {course.skillFocus?.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.skillFocus.length - 2}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">
                  {formatCurrency(course.priceCents, course.currency)}
                </span>
                <span className="text-muted-foreground">{formatDate(course.createdAt)}</span>
              </div>

              <div className="text-xs text-muted-foreground break-words">
                {course.moduleCount} chương • {course.lessonCount} bài học
              </div>
            </div>
          </div>
        </td>

        <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
          <Badge className={getStatusColor(course.status)}>{getStatusLabel(course.status)}</Badge>
        </td>

        <td className="px-4 py-4 hidden lg:table-cell">
          <div className="flex flex-wrap gap-1 max-w-xs break-words">
            {course.skillFocus?.slice(0, 2).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase()}
              </Badge>
            ))}
            {course.skillFocus?.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{course.skillFocus.length - 2}
              </Badge>
            )}
          </div>
        </td>

        <td className="px-4 py-4 whitespace-nowrap text-sm hidden md:table-cell">
          {formatCurrency(course.priceCents, course.currency)}
        </td>

        <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
          <div className="text-xs text-muted-foreground">
            <div>{course.moduleCount} chương</div>
            <div>{course.lessonCount} bài học</div>
          </div>
        </td>

        <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground hidden md:table-cell">
          {formatDate(course.createdAt)}
        </td>

        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-1">
            {course.status === "PUBLISHED" && (
              <Link href={`/admin/courses/${course.slug}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-8 w-8"
                  title="Xem chi tiết"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
            )}

            {canApprove && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-8 w-8 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                onClick={handleApprove}
                title="Phê duyệt"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}

            {canReject && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-8 w-8 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                onClick={handleReject}
                title="Từ chối"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            )}

            {course.status === "PUBLISHED" && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-8 w-8 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                onClick={handleUnpublish}
                title="Gỡ xuất bản"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            )}
          </div>
        </td>
      </tr>

      <CourseStatusConfirmDialog
        open={confirmDialog.open}
        onOpenChange={handleDialogOpenChange}
        courseTitle={course.title}
        action={confirmDialog.action}
        onConfirm={handleConfirmAction}
      />
    </>
  )
})

export default CourseTableRow