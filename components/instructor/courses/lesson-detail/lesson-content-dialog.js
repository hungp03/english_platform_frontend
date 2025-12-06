"use client"

import { useRef, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Editor from "@/components/common/editor"
import { updateLesson } from "@/lib/api/lesson"

export default function LessonContentDialog({ open, onOpenChange, lesson, onUpdated }) {
  const { moduleId, lessonId } = useParams()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [intro, setIntro] = useState("")
  const [initialContent, setInitialContent] = useState("")
  const contentRef = useRef("")

  // Extract HTML content from sections only (not intro)
  const getInitialContent = () => {
    if (lesson?.content?.body?.sections) {
      let htmlContent = ""
      lesson.content.body.sections.forEach(section => {
        if (section.html) {
          htmlContent += section.html
        }
      })
      return htmlContent
    }
    return ""
  }

  // Initialize state when dialog opens or lesson changes
  useEffect(() => {
    if (open && lesson) {
      setTitle(lesson.title || "")
      setIntro(lesson.content?.body?.intro || "")
      const content = getInitialContent()
      setInitialContent(content)
      contentRef.current = content
    }
  }, [open, lesson])

  if (!lesson) return null

  const handleContentChange = (newContent) => {
    contentRef.current = newContent
  }

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        kind: lesson.kind,
        estimatedMin: lesson.estimatedMin,
        position: lesson.position,
        isFree: lesson.isFree,
        content: {
          type: "html",
          body: {
            intro: intro.trim() || undefined,
            sections: contentRef.current ? [{ html: contentRef.current }] : []
          }
        },
        mediaId: lesson.primaryMediaId || null,
      }

      const res = await updateLesson(moduleId, lessonId, payload)
      if (res.success) {
        toast.success("Nội dung bài học đã được cập nhật")
        onUpdated(res.data)
        onOpenChange(false)
      } else {
        toast.error(res.error || "Không thể cập nhật nội dung")
      }
    } catch (err) {
      console.error(err)
      toast.error("Đã xảy ra lỗi khi cập nhật nội dung")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl h-[90vh] flex flex-col w-full p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Chỉnh sửa nội dung</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
          <div className="flex-shrink-0">
            <Label htmlFor="lessonTitle">Tiêu đề bài học</Label>
            <Input
              id="lessonTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài học"
              className="mt-1"
            />
          </div>
          <div className="flex-shrink-0">
            <Label htmlFor="lessonIntro">Giới thiệu</Label>
            <Textarea
              id="lessonIntro"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Nhập giới thiệu ngắn cho bài học"
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <Label className="flex-shrink-0 mb-2">Nội dung chi tiết</Label>
            <div className="flex-1 overflow-auto min-h-0">
              {open && (
                <Editor
                  key={lesson?.id || 'editor'}
                  initialContent={initialContent}
                  onContentChange={handleContentChange}
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 pt-4">
          <Button
            className="w-full bg-gradient-primary"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
