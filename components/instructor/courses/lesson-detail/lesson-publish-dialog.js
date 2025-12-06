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

export default function LessonPublishDialog({ open, onOpenChange, lesson, isPublishing, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const calledRef = useRef(false)

  // Reset loading state when dialog closes
  useEffect(() => {
    if (!open) {
      setLoading(false)
      calledRef.current = false
    }
  }, [open])

  if (!lesson) return null

  const handleConfirm = async () => {
    if (loading || calledRef.current) return
    calledRef.current = true
    setLoading(true)
    try {
      await onConfirm?.(lesson, isPublishing)
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
            {isPublishing ? "Xác nhận xuất bản bài học" : "Xác nhận hủy xuất bản"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPublishing ? (
              <>
                Bạn có chắc muốn xuất bản bài học "{lesson.title}"?
                Bài học sẽ hiển thị công khai cho học viên.
              </>
            ) : (
              <>
                Bạn có chắc muốn hủy xuất bản bài học "{lesson.title}"?
                Bài học sẽ không còn hiển thị cho học viên.
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
              ? (isPublishing ? "Đang xuất bản..." : "Đang hủy...")
              : (isPublishing ? "Xuất bản" : "Hủy xuất bản")
            }
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
