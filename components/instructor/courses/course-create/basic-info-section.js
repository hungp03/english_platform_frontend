"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Editor from "@/components/common/editor"

export default function BasicInfoSection({
  register,
  errors,
  detailedDescription,
  setDetailedDescription,
}) {
  return (
    <>
      {/* Title */}
      <div>
        <Label htmlFor="title" className="mb-2">Tiêu đề *</Label>
        <Input id="title" placeholder="VD: English for Beginners" {...register("title")} />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="mb-2">Mô tả ngắn</Label>
        <Textarea id="description" placeholder="Mô tả ngắn..." rows={4} {...register("description")} />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      {/* Detailed Description */}
      <div>
        <Label htmlFor="detailedDescription" className="mb-2">Mô tả chi tiết (HTML)</Label>
        <div className="border rounded-lg">
          <Editor
            initialContent={detailedDescription}
            onContentChange={(content) => setDetailedDescription(content)}
          />
        </div>
        {errors.detailedDescription && <p className="text-red-500 text-sm mt-1">{errors.detailedDescription.message}</p>}
      </div>

      {/* Language */}
      <div>
        <Label htmlFor="language" className="mb-2">Ngôn ngữ *</Label>
        <Input id="language" placeholder="VD: en, vi" {...register("language")} />
        {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>}
      </div>
    </>
  )
}
