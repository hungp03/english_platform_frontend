"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteLesson, publishLesson } from "@/lib/api/lesson"
import LessonPublishDialog from "./lesson-publish-dialog"

// Helper: chuyển kind sang tiếng Việt gọn gàng
function getKindLabel(kind) {
  switch (kind?.toLowerCase()) {
    case "video":
      return "Video"
    case "article":
    case "html":
      return "Bài đọc"
    case "quiz":
      return "Bài kiểm tra"
    default:
      return kind || "Không xác định"
  }
}

export default function LessonHeader({ lesson }) {
  const router = useRouter()
  const params = useParams()
  const { courseId, moduleId, lessonId } = params
  const kindLabel = getKindLabel(lesson.kind)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [isPublished, setIsPublished] = useState(lesson.published || false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [pendingPublishState, setPendingPublishState] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await deleteLesson(moduleId, lessonId)
      if (res.success) {
        toast.success("Xóa bài học thành công!")
        router.push(`/instructor/courses/${courseId}/modules/${moduleId}`)
      } else {
        toast.error(res.error || "Không thể xóa bài học")
      }
    } catch (err) {
      console.error(err)
      toast.error("Đã xảy ra lỗi khi xóa bài học")
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleEditClick = () => {
    if (isPublished) {
      toast.error("Vui lòng hủy xuất bản bài học trước khi chỉnh sửa")
      return
    }
    router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/edit`)
  }

  const handlePublishClick = () => {
    const newPublishState = !isPublished
    setPendingPublishState(newPublishState)
    setShowPublishDialog(true)
  }

  const handlePublishConfirm = async () => {
    // Optimistic update
    setIsPublished(pendingPublishState)
    setIsUpdating(true)
    setShowPublishDialog(false)

    const result = await publishLesson(moduleId, lessonId, pendingPublishState)

    setIsUpdating(false)

    if (result.success) {
      toast.success(
        pendingPublishState
          ? "Bài học đã được xuất bản"
          : "Đã hủy xuất bản bài học"
      )
    } else {
      // Rollback on failure
      setIsPublished(!pendingPublishState)
      toast.error(result.error || "Không thể cập nhật trạng thái xuất bản")
    }
  }

  return (
    <>
      <Card className="shadow-elegant bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Hàng badge */}
              <div className="flex items-center flex-wrap gap-3 mb-2">
                <Badge variant="outline">Lesson {lesson.position}</Badge>

                <Badge
                  className={
                    isPublished
                      ? "bg-green-400 text-white"
                      : "bg-gray-400 text-white"
                  }
                >
                  {isPublished ? "Đã xuất bản" : "Chưa xuất bản"}
                </Badge>

                {lesson.isFree && (
                  <Badge className="bg-emerald-600 text-white">
                    Miễn phí
                  </Badge>
                )}
              </div>

              {/* Tiêu đề */}
              <CardTitle className="text-3xl mb-2">{lesson.title}</CardTitle>

              {/* Thông tin phụ */}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>{kindLabel}</span>
                {lesson.estimatedMin && (
                  <>
                    <span>•</span>
                    <span>{lesson.estimatedMin} phút</span>
                  </>
                )}
              </div>
            </div>

            {/* Action menu */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover z-50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <DropdownMenuItem
                            onClick={handleEditClick}
                            disabled={isPublished}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                          </DropdownMenuItem>
                        </div>
                      </TooltipTrigger>
                      {isPublished && (
                        <TooltipContent side="left">
                          Vui lòng hủy xuất bản trước khi chỉnh sửa
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuItem
                    onClick={handlePublishClick}
                    disabled={isUpdating}
                  >
                    {isPublished ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" /> Hủy xuất bản
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" /> Xuất bản
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Xóa bài học
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa bài học này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bài học sẽ bị xóa vĩnh viễn khỏi module.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Confirmation Dialog */}
      <LessonPublishDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        lesson={lesson}
        isPublishing={pendingPublishState}
        onConfirm={handlePublishConfirm}
      />
    </>
  )
}
