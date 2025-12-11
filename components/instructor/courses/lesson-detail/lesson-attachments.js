"use client"

import { useState, useRef } from "react"
import { FileText, Image, Music, Video, X, Loader2, Plus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { uploadAttachment } from "@/lib/api/course"
import { attachMediaToLesson, detachMediaFromLesson } from "@/lib/api/lesson"

const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return Image
  if (mimeType?.startsWith('video/')) return Video
  if (mimeType?.startsWith('audio/')) return Music
  return FileText
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function LessonAttachments({ lesson, moduleId, onLessonUpdated }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [title, setTitle] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [removingIds, setRemovingIds] = useState(new Set())
  const fileInputRef = useRef(null)

  const attachments = lesson.mediaAssets?.filter(asset => asset.role === 'ATTACHMENT') || []

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-fill title từ tên file (bỏ extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      setTitle(nameWithoutExt)
    }
  }

  const handleUploadAndAttach = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      // 1. Upload file
      const uploadResult = await uploadAttachment(selectedFile, title.trim() || null)
      if (!uploadResult.success) {
        toast.error(uploadResult.error || "Không thể tải file lên")
        return
      }

      const uploadedAsset = uploadResult.data

      // 2. Attach to lesson
      const attachResult = await attachMediaToLesson(moduleId, lesson.id, uploadedAsset.id)
      if (!attachResult.success) {
        toast.error(attachResult.error || "Không thể thêm file vào bài học")
        return
      }

      toast.success("Đã thêm tài liệu thành công")

      // Optimistic update: thêm attachment mới vào lesson
      const newAttachment = {
        ...uploadedAsset,
        role: 'ATTACHMENT',
        title: title.trim() || null,
        meta: {
          originalName: selectedFile.name,
          size: selectedFile.size
        }
      }
      
      if (onLessonUpdated) {
        onLessonUpdated(prev => ({
          ...prev,
          mediaAssets: [...(prev.mediaAssets || []), newAttachment]
        }))
      }
      
      // Reset form
      setSelectedFile(null)
      setTitle("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error("Error uploading attachment:", err)
      toast.error("Đã xảy ra lỗi khi tải file lên")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAttachment = async (attachment) => {
    const mediaId = attachment.id
    setRemovingIds(prev => new Set(prev).add(mediaId))

    try {
      const result = await detachMediaFromLesson(moduleId, lesson.id, mediaId)
      if (!result.success) {
        toast.error(result.error || "Không thể xóa tài liệu")
        return
      }

      toast.success("Đã xóa tài liệu thành công")
      
      // Optimistic update: xóa attachment khỏi lesson
      if (onLessonUpdated) {
        onLessonUpdated(prev => ({
          ...prev,
          mediaAssets: prev.mediaAssets?.filter(a => a.id !== mediaId) || []
        }))
      }
    } catch (err) {
      console.error("Error removing attachment:", err)
      toast.error("Đã xảy ra lỗi khi xóa tài liệu")
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(mediaId)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload form */}
      <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
        <Label className="text-sm font-medium">
          Thêm tài liệu mới (tối đa 20MB)
        </Label>
        <Input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp3,.wav,.mp4,.avi"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        {selectedFile && (
          <Input
            placeholder="Tiêu đề tài liệu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        )}
        <Button
          onClick={handleUploadAndAttach}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {isUploading ? "Đang tải..." : "Thêm tài liệu"}
        </Button>
      </div>

      {/* Attachments list */}
      {attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.mimeType)
            const isRemoving = removingIds.has(attachment.id)
            
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 flex-shrink-0">
                  <FileIcon className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {attachment.title || attachment.meta?.originalName || `File ${attachment.id.slice(0, 8)}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {attachment.mimeType}
                    </Badge>
                    {attachment.meta?.size && (
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.meta.size)}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAttachment(attachment)}
                  disabled={isRemoving}
                  className="text-destructive hover:text-destructive"
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có tài liệu đính kèm</p>
        </div>
      )}
    </div>
  )
}
