"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload, Loader2 } from "lucide-react"

export default function ThumbnailUploadSection({
  thumbnailPreview,
  thumbnailFile,
  uploading,
  fileInputRef,
  handleFileSelect,
  handleRemoveImage,
  handleUploadImage,
  errors,
}) {
  return (
    <div>
      <Label htmlFor="thumbnail" className="mb-2">Ảnh Thumbnail</Label>

      {/* Image preview */}
      {thumbnailPreview && (
        <div className="relative w-full mb-3 rounded-lg overflow-hidden border-2 border-muted" style={{ aspectRatio: '16/9' }}>
          <img
            src={thumbnailPreview}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* File input */}
      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          id="thumbnail"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="flex-1"
          disabled={uploading}
        />
        {thumbnailFile && !uploading && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleUploadImage}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Tải lên
          </Button>
        )}
        {uploading && (
          <Button type="button" variant="secondary" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Đang tải...
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-1">
        Chọn ảnh và nhấn "Tải lên" để upload. Tối đa 5MB. Nên chọn ảnh có tỉ lệ 16:9 để tối ưu hiển thị.
      </p>

      {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail.message}</p>}
    </div>
  )
}
