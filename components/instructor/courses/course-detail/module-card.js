"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ModuleCard({ module, courseId, onEdit, onDelete }) {
  const hasLessons = (module.lessonCount || 0) > 0
  const isPublished = module.published === true
  const position = module.position

  const deleteTooltipText = hasLessons
    ? "Vui lòng xóa hết bài học trước"
    : "Xóa module này"

  const editTooltipText = isPublished
    ? "Vui lòng hủy xuất bản trước khi chỉnh sửa"
    : "Chỉnh sửa module"

  const handleEditClick = () => {
    if (isPublished) {
      toast.error("Vui lòng hủy xuất bản module trước khi chỉnh sửa")
      return
    }
    onEdit(module)
  }

  return (
    <Card className="shadow-elegant hover:shadow-glow transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
              {position}
            </div>

            <div className="flex-1">
              <CardTitle className="text-xl mb-1">{module.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{module.lessonCount || 0} bài học</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEditClick}
                      disabled={isPublished}
                      className={isPublished ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{editTooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={hasLessons}
                      onClick={() => !hasLessons && onDelete(module)}
                      className={`${
                        hasLessons
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-destructive/10"
                      }`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{deleteTooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Link href={`/instructor/courses/${courseId}/modules/${module.id}`}>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
