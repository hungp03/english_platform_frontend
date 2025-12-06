"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, BookPlus } from "lucide-react"
import { toast } from "sonner"
import { courseSchema } from "@/schema/course"
import { createCourse, uploadMedia } from "@/lib/api/course"

import BasicInfoSection from "@/components/instructor/courses/course-create/basic-info-section"
import ThumbnailUploadSection from "@/components/instructor/courses/course-create/thumbnail-upload-section"
import SkillFocusSection from "@/components/instructor/courses/course-create/skill-focus-section"
import PricingSection from "@/components/instructor/courses/course-create/pricing-section"

function PageHeader() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/instructor/courses">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <BookPlus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Tạo khóa học mới</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Điền thông tin để tạo khóa học
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CreateCoursePage() {
  const router = useRouter()

  const [selectedSkills, setSelectedSkills] = useState([])
  const [customSkills, setCustomSkills] = useState([])
  const [customInput, setCustomInput] = useState("")
  const customInputRef = useRef(null)

  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [detailedDescription, setDetailedDescription] = useState("")

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      detailedDescription: "",
      language: "",
      thumbnail: "",
      priceCents: "",
      currency: "VND",
    },
  })

  const { register, handleSubmit, setValue, formState, setError, clearErrors } = form
  const { errors, isSubmitting } = formState

  const allSkills = useMemo(() => [...selectedSkills, ...customSkills], [selectedSkills, customSkills])

  const toKey = useCallback((s) => s.toLocaleLowerCase(), [])
  const selectedLower = useMemo(() => selectedSkills.map(toKey), [selectedSkills, toKey])
  const customLower = useMemo(() => customSkills.map(toKey), [customSkills, toKey])
  const allLower = useMemo(() => allSkills.map(toKey), [allSkills, toKey])

  const existsInSelected = useCallback((name) => selectedLower.includes(toKey(name)), [selectedLower, toKey])
  const existsInCustom = useCallback((name) => customLower.includes(toKey(name)), [customLower, toKey])
  const existsInAll = useCallback((name) => existsInSelected(name) || existsInCustom(name), [existsInSelected, existsInCustom])

  const toggleSkill = useCallback((skill) => {
    if (existsInCustom(skill)) {
      toast.error(`"${skill}" đã tồn tại trong danh sách kỹ năng tự nhập`)
      return
    }
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
    clearErrors("skillFocus")
  }, [existsInCustom, clearErrors])

  const addCustomSkill = useCallback(() => {
    const raw = customInput.trim()
    if (!raw) return
    if (existsInAll(raw)) {
      toast.error(`Kỹ năng "${raw}" đã tồn tại`)
      return
    }
    setCustomSkills((prev) => [...prev, raw])
    setCustomInput("")
    customInputRef.current?.focus()
    clearErrors("skillFocus")
  }, [customInput, existsInAll, clearErrors])

  const handleCustomKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCustomSkill()
    }
  }, [addCustomSkill])

  const removeSkill = useCallback((skill) => {
    const key = toKey(skill)
    if (customLower.includes(key)) {
      setCustomSkills((prev) => prev.filter((s) => toKey(s) !== key))
    } else if (selectedLower.includes(key)) {
      setSelectedSkills((prev) => prev.filter((s) => toKey(s) !== key))
    }
  }, [toKey, customLower, selectedLower])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB")
      return
    }

    setThumbnailFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnailPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRemoveImage = useCallback(() => {
    setThumbnailFile(null)
    setThumbnailPreview("")
    setValue("thumbnail", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [setValue])

  const handleUploadImage = useCallback(async () => {
    if (!thumbnailFile) return

    setUploading(true)
    try {
      const res = await uploadMedia(thumbnailFile, "course_thumbnail")
      if (res.success && res.data?.url) {
        setValue("thumbnail", res.data.url)
        toast.success("Tải ảnh lên thành công!")
        return res.data.url
      } else {
        toast.error(res.error || "Không thể tải ảnh lên")
        return null
      }
    } catch (err) {
      console.error("Upload error:", err)
      toast.error("Đã xảy ra lỗi khi tải ảnh")
      return null
    } finally {
      setUploading(false)
    }
  }, [thumbnailFile, setValue])

  useEffect(() => {
    setValue("skillFocus", allSkills, { shouldValidate: false })
    if (allSkills.length > 0) clearErrors("skillFocus")
  }, [allSkills, setValue, clearErrors])

  useEffect(() => {
    setValue("detailedDescription", detailedDescription, { shouldValidate: false })
  }, [detailedDescription, setValue])

  const onSubmit = async (data) => {
    try {
      if (allSkills.length === 0) {
        setError("skillFocus", { type: "manual", message: "Vui lòng chọn hoặc nhập ít nhất 1 kỹ năng" })
        toast.error("Cần ít nhất 1 kỹ năng")
        return
      }

      const uniqueCount = new Set(allLower).size
      if (uniqueCount !== allSkills.length) {
        setError("skillFocus", { type: "manual", message: "Danh sách kỹ năng đang bị trùng" })
        toast.error("Danh sách kỹ năng đang bị trùng")
        return
      }

      let thumbnailUrl = data.thumbnail
      if (thumbnailFile && !uploading) {
        const uploadedUrl = await handleUploadImage()
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl
        } else {
          toast.error("Vui lòng thử tải ảnh lên lại")
          return
        }
      }

      const payload = {
        ...data,
        thumbnail: thumbnailUrl,
        detailedDescription: detailedDescription || null,
        skillFocus: allSkills,
        priceCents: Number(data.priceCents || 0),
        currency: (data.currency || "VND").toUpperCase(),
      }

      const res = await createCourse(payload)
      const newCourse = res?.data?.result || res?.data

      toast.success("Đã tạo khóa học mới!")

      if (newCourse?.id) {
        router.push(`/instructor/courses/${newCourse.id}`)
      } else {
        router.push("/instructor/courses")
      }
    } catch (err) {
      console.error("Lỗi tạo khóa học:", err)
      toast.error(err?.message || "Không thể tạo khóa học")
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <PageHeader />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
              <CardDescription>Các trường đánh dấu * là bắt buộc</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <BasicInfoSection
                register={register}
                errors={errors}
                detailedDescription={detailedDescription}
                setDetailedDescription={setDetailedDescription}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Hình ảnh đại diện</CardTitle>
              <CardDescription>Tải lên ảnh thumbnail cho khóa học (tối đa 5MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <ThumbnailUploadSection
                thumbnailPreview={thumbnailPreview}
                thumbnailFile={thumbnailFile}
                uploading={uploading}
                fileInputRef={fileInputRef}
                handleFileSelect={handleFileSelect}
                handleRemoveImage={handleRemoveImage}
                handleUploadImage={handleUploadImage}
                errors={errors}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Kỹ năng tập trung</CardTitle>
              <CardDescription>Chọn hoặc nhập kỹ năng mà khóa học hướng đến</CardDescription>
            </CardHeader>
            <CardContent>
              <SkillFocusSection
                selectedSkills={selectedSkills}
                customSkills={customSkills}
                customInput={customInput}
                customInputRef={customInputRef}
                setCustomInput={setCustomInput}
                toggleSkill={toggleSkill}
                addCustomSkill={addCustomSkill}
                handleCustomKeyDown={handleCustomKeyDown}
                removeSkill={removeSkill}
                toKey={toKey}
                register={register}
                errors={errors}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Giá khóa học</CardTitle>
              <CardDescription>Thiết lập giá và đơn vị tiền tệ</CardDescription>
            </CardHeader>
            <CardContent>
              <PricingSection
                register={register}
                errors={errors}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/instructor/courses")}
              className="sm:flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="sm:flex-1"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo khóa học"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
