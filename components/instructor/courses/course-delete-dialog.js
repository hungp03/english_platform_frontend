"use client"
import { useState, useRef } from "react"
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

export default function CourseDeleteDialog({ open, onOpenChange, course, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const calledRef = useRef(false)
  if (!course) return null

  const handleDelete = async () => {
    if (loading || calledRef.current) return
    calledRef.current = true
    setLoading(true)
    try {
      await onConfirm?.(course)
    } finally {
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
          <AlertDialogTitle>Xác nhận xóa khóa học</AlertDialogTitle>
          <AlertDialogDescription>
            Xóa "{course.title}"? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
