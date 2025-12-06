"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CoursePublishDialog({ open, onOpenChange, course, isPublishing, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const calledRef = useRef(false)

  // Reset loading state when dialog closes
  useEffect(() => {
    if (!open) {
      setLoading(false)
      calledRef.current = false
    }
  }, [open])

  if (!course) return null

  const handleConfirm = async () => {
    if (loading || calledRef.current) return
    calledRef.current = true
    setLoading(true)
    try {
      await onConfirm?.(course, isPublishing)
    } finally {
      setLoading(false)
      setTimeout(() => { calledRef.current = false }, 300)
    }
  }

  const handleOpenChange = (next) => {
    if (!loading) onOpenChange(next)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPublishing ? "Xác nhận xuất bản khóa học" : "Xác nhận ẩn khóa học"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPublishing ? (
              <>
                Bạn có chắc muốn xuất bản khóa học "{course.title}"?
                Khóa học sẽ hiển thị công khai cho học viên.
              </>
            ) : (
              <>
                Bạn có chắc muốn ẩn khóa học "{course.title}"?
                Khóa học sẽ không còn hiển thị công khai nhưng vẫn được lưu lại.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={isPublishing ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
          >
            {loading
              ? (isPublishing ? "Đang xuất bản..." : "Đang ẩn...")
              : (isPublishing ? "Xuất bản" : "Ẩn khóa học")
            }
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
