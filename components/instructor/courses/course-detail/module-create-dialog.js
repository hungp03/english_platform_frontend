"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { createCourseModule } from "@/lib/api/course-module"
import { moduleSchema } from "@/schema/course"

export default function ModuleCreateDialog({ open, onOpenChange, courseId, onCreateSuccess }) {
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

  const onSubmit = async (values) => {
    try {
      const payload = {
        title: values.title,
        position: values.position,
      }

      const res = await createCourseModule(courseId, payload)
      if (res.success) {
        onCreateSuccess?.(res.data)
        reset()
        onOpenChange(false)
      } else {
        toast.error(res.error || "Không thể tạo module")
      }
    } catch (err) {
      console.error("Lỗi tạo module:", err)
      toast.error("Lỗi khi tạo module")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary shadow-glow">
          <Plus className="h-4 w-4 mr-2" />
          Thêm module mới
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo module mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="mb-1">
              Tiêu đề module *
            </Label>
            <Input
              id="title"
              placeholder="VD: Introduction to English"
              disabled={isSubmitting}
              {...register("title")}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Position */}
          <div>
            <Label htmlFor="position" className="mb-1">
              Số thứ tự *
            </Label>
            <Input
              id="position"
              type="number"
              min={0}
              placeholder="VD: 1"
              disabled={isSubmitting}
              {...register("position")}
            />
            {errors.position && (
              <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full bg-gradient-primary" disabled={isSubmitting}>
            {isSubmitting ? "Đang tạo..." : "Tạo module"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
