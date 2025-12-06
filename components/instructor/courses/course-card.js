"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreVertical, Edit, Trash2, Eye, CheckCircle, XCircle, Send, EyeOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { publishCourse, changeCourseStatus } from "@/lib/api/course"
import { toast } from "sonner"
import CoursePublishDialog from "./course-publish-dialog"

export default function CourseCard({ course, onEdit, onDelete }) {
  const [status, setStatus] = useState(course.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [pendingPublishState, setPendingPublishState] = useState(false)

  const skills = Array.isArray(course.skillFocus) ? course.skillFocus : []
  const visibleSkills = skills.slice(0, 3)
  const remainingCount = skills.length - visibleSkills.length

  const isPublished = status === "PUBLISHED"
  const canEdit = status === "DRAFT" || status === "REJECTED" || status === "UNPUBLISHED"

  const handleEditClick = () => {
    if (!canEdit) {
      toast.error("Vui lòng hủy xuất bản khóa học trước khi chỉnh sửa")
      return
    }
    onEdit(course)
  }

  const handleStatusChange = async (newStatus) => {
    if (isUpdating) return

    setIsUpdating(true)
    const previousStatus = status
    setStatus(newStatus)

    const result = await changeCourseStatus(course.id, newStatus)
    setIsUpdating(false)

    if (result.success) {
      const successMessages = {
        "PUBLISHED": "Khóa học đã được xuất bản",
        "UNPUBLISHED": "Đã ẩn khóa học",
        "PENDING_REVIEW": "Khóa học đã được gửi để xét duyệt",
        "DRAFT": "Khóa học đã được chuyển về bản nháp"
      }
      toast.success(successMessages[newStatus] || "Trạng thái khóa học đã được cập nhật")
    } else {
      // Rollback on failure
      setStatus(previousStatus)
      toast.error(result.error || "Không thể cập nhật trạng thái khóa học")
    }
  }

  const handlePublishClick = () => {
    const newPublishState = !isPublished
    setPendingPublishState(newPublishState)
    setShowPublishDialog(true)
  }

  const handlePublishConfirm = async () => {
    // Optimistic update
    const newStatus = pendingPublishState ? "PUBLISHED" : "UNPUBLISHED"
    setShowPublishDialog(false)
    await handleStatusChange(newStatus)
  }

  return (
    <Card className="overflow-hidden shadow-elegant hover:shadow-glow transition-shadow py-0 gap-0">
      {/* --- Thumbnail + trạng thái --- */}
      <div className="aspect-video relative overflow-hidden">
        <img
          src={course.thumbnail || "/course-placeholder.jpeg"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <Badge
          className={`absolute top-2 right-2 ${
            status === "PUBLISHED" ? "bg-green-500 hover:bg-green-600" :
            status === "DRAFT" ? "bg-gray-400 hover:bg-gray-500" :
            status === "PENDING_REVIEW" ? "bg-yellow-500 hover:bg-yellow-600" :
            status === "REJECTED" ? "bg-red-500 hover:bg-red-600" :
            status === "UNPUBLISHED" ? "bg-orange-500 hover:bg-orange-600" :
            "bg-gray-400 hover:bg-gray-500"
          }`}
        >
          {
            status === "PUBLISHED" ? "Đã xuất bản" :
            status === "DRAFT" ? "Bản nháp" :
            status === "PENDING_REVIEW" ? "Chờ duyệt" :
            status === "REJECTED" ? "Bị từ chối" :
            status === "UNPUBLISHED" ? "Đã ẩn" :
            "Không xác định"
          }
        </Badge>
      </div>

      {/* --- Nội dung --- */}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/instructor/courses/${course.id}`} className="hover:underline">
              <h3 className="font-semibold text-lg text-foreground">{course.title}</h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">{course.description}</p>

            {/* --- Skill badges --- */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {visibleSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="capitalize">
                    {skill}
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge variant="outline">+{remainingCount}</Badge>
                )}
              </div>
            )}
          </div>

          {/* --- Menu hành động --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="bg-popover z-50">
              {/* Link item: Xem chi tiết */}
              <DropdownMenuItem asChild>
                <Link href={`/instructor/courses/${course.id}`} className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                </Link>
              </DropdownMenuItem>

              {/* Link item: Quản lý đánh giá */}
              <DropdownMenuItem asChild>
                <Link href={`/instructor/courses/${course.id}/reviews`} className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" /> Quản lý đánh giá
                </Link>
              </DropdownMenuItem>

              {/* Edit with tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* wrap in div to allow disabled behavior */}
                    <div>
                      <DropdownMenuItem
                        onClick={handleEditClick}
                        disabled={!canEdit}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                      </DropdownMenuItem>
                    </div>
                  </TooltipTrigger>
                  {!canEdit && (
                    <TooltipContent side="left">
                      {status === "PUBLISHED"
                        ? "Vui lòng hủy xuất bản khóa học trước khi chỉnh sửa"
                        : status === "PENDING_REVIEW"
                        ? "Khóa học đang chờ duyệt, không thể chỉnh sửa"
                        : "Không thể chỉnh sửa khóa học ở trạng thái này"
                      }
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {/* Conditional status actions */}
              {status === "DRAFT" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange("PENDING_REVIEW")}
                  disabled={isUpdating}
                >
                  <Send className="h-4 w-4 mr-2" /> Gửi xét duyệt
                </DropdownMenuItem>
              )}

              {status === "PENDING_REVIEW" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange("DRAFT")}
                  disabled={isUpdating}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Hủy gửi xét duyệt
                </DropdownMenuItem>
              )}

              {status === "PUBLISHED" && (
                <DropdownMenuItem
                  onClick={handlePublishClick}
                  disabled={isUpdating}
                >
                  <EyeOff className="h-4 w-4 mr-2" /> Ẩn khóa học
                </DropdownMenuItem>
              )}

              {status === "UNPUBLISHED" && (
                <DropdownMenuItem
                  onClick={handlePublishClick}
                  disabled={isUpdating}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Xuất bản lại
                </DropdownMenuItem>
              )}

              {status === "REJECTED" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange("DRAFT")}
                  disabled={isUpdating}
                >
                  <Edit className="h-4 w-4 mr-2" /> Chuyển qua bản nháp
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(course)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* --- Thống kê --- */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{course.students ?? 0} học viên</span>
          <span>•</span>
          <span>{course.moduleCount} modules</span>
          <span>•</span>
          <span>{course.lessonCount} bài học</span>
        </div>
      </CardContent>

      <CoursePublishDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        course={course}
        isPublishing={pendingPublishState}
        onConfirm={handlePublishConfirm}
      />
    </Card>
  )
}
