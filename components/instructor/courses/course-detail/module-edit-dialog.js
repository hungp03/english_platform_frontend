"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateCourseModule } from "@/lib/api/course-module"
import { moduleSchema } from "@/schema/course"

export default function ModuleEditDialog({ open, onOpenChange, module, courseId, onUpdateSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: "",
      position: "",
    },
  })

  // Khi mở dialog, reset dữ liệu cũ
  useEffect(() => {
    if (module) {
      reset({
        title: module.title || "",
        position: module.position?.toString() || "",
      })
    }
  }, [module, reset])

  if (!module) return null

  const onSubmit = async (values) => {
    try {
      const payload = {
        id: module.id,
        title: values.title.trim(),
        position: values.position,
      }

      const res = await updateCourseModule(courseId, payload)
      if (res.success) {
        toast.success("Đã cập nhật module")

        // Optimistic update
        onUpdateSuccess?.({
          ...module,
          title: res.data?.title ?? values.title,
          position: res.data?.position ?? values.position,
          lessonCount: module.lessonCount ?? 0,
        })

        onOpenChange(false)
      } else {
        toast.error(res.error || "Không thể cập nhật module")
      }
    } catch (err) {
      console.error("Lỗi cập nhật module:", err)
      toast.error("Lỗi khi cập nhật module")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa module</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="editTitle" className="mb-1">
              Tiêu đề module *
            </Label>
            <Input
              id="editTitle"
              placeholder="VD: Grammar Basics"
              disabled={isSubmitting}
              {...register("title")}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Position */}
          <div>
            <Label htmlFor="editPosition" className="mb-1">
              Số thứ tự *
            </Label>
            <Input
              id="editPosition"
              type="number"
              placeholder="VD: 1"
              disabled={isSubmitting}
              {...register("position")}
            />
            {errors.position && (
              <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full bg-gradient-primary" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Cập nhật module"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
