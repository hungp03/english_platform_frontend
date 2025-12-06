"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, FileEdit, AlertCircle, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { courseSchema } from "@/schema/course"
import { updateCourse, uploadMedia, getCourseById } from "@/lib/api/course"

import BasicInfoSection from "@/components/instructor/courses/course-create/basic-info-section"
import ThumbnailUploadSection from "@/components/instructor/courses/course-create/thumbnail-upload-section"
import SkillFocusSection from "@/components/instructor/courses/course-create/skill-focus-section"
import PricingSection from "@/components/instructor/courses/course-create/pricing-section"

const SKILL_OPTIONS = ["Listening", "Reading", "Writing", "Speaking", "Grammar", "Vocabulary"]

function PageHeader({ courseId }) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/instructor/courses/${courseId}`}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <FileEdit className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Chỉnh sửa khóa học</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Cập nhật thông tin khóa học
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ErrorState({ courseId, onRetry }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Không tìm thấy khóa học</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          Khóa học không tồn tại hoặc bạn không có quyền truy cập
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/instructor/courses">Quay lại</Link>
          </Button>
          <Button onClick={onRetry}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EditCoursePage() {
  const router = useRouter()
  const { courseId } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [course, setCourse] = useState(null)

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

  const { register, handleSubmit, setValue, reset, formState, setError: setFormError, clearErrors } = form
  const { errors, isSubmitting } = formState

  const fetchCourse = useCallback(async () => {
    if (!courseId) return

    setLoading(true)
    setError(false)
    try {
      const res = await getCourseById(courseId)
      if (res.success && res.data) {
        const courseData = res.data

        if (courseData.published) {
          toast.error("Khóa học đã được xuất bản. Vui lòng hủy xuất bản trước khi chỉnh sửa")
          router.push(`/instructor/courses/${courseId}`)
          return
        }

        setCourse(courseData)

        reset({
          title: courseData.title || "",
          description: courseData.description || "",
          detailedDescription: courseData.detailedDescription || "",
          language: courseData.language || "",
          thumbnail: courseData.thumbnail || "",
          priceCents: typeof courseData.priceCents === "number" ? String(courseData.priceCents) : (courseData.priceCents ?? ""),
          currency: courseData.currency || "VND",
        })

        setDetailedDescription(courseData.detailedDescription || "")

        if (courseData.thumbnail) {
          setThumbnailPreview(courseData.thumbnail)
        }

        const initial = Array.isArray(courseData.skillFocus) ? courseData.skillFocus : []
        const lowerSet = new Set(initial.map((s) => s.trim().toLocaleLowerCase()))
        const preset = SKILL_OPTIONS.filter((s) => lowerSet.has(s.toLocaleLowerCase()))
        const custom = initial.filter(
          (s) => !SKILL_OPTIONS.map((x) => x.toLocaleLowerCase()).includes(s.trim().toLocaleLowerCase())
        )
        setSelectedSkills(preset)
        setCustomSkills(custom)
      } else {
        setError(true)
        toast.error(res.error || "Không thể tải thông tin khóa học")
      }
    } catch (err) {
      console.error(err)
      setError(true)
      toast.error("Đã xảy ra lỗi khi tải thông tin khóa học")
    } finally {
      setLoading(false)
    }
  }, [courseId, reset, router])

  useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

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
        setFormError("skillFocus", { type: "manual", message: "Vui lòng chọn hoặc nhập ít nhất 1 kỹ năng" })
        toast.error("Cần ít nhất 1 kỹ năng")
        return
      }

      const uniqueCount = new Set(allLower).size
      if (uniqueCount !== allSkills.length) {
        setFormError("skillFocus", { type: "manual", message: "Danh sách kỹ năng đang bị trùng" })
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

      await updateCourse(courseId, payload)

      toast.success("Đã cập nhật khóa học!")
      router.push(`/instructor/courses/${courseId}`)
    } catch (err) {
      console.error("Lỗi cập nhật khóa học:", err)
      toast.error(err?.message || "Không thể cập nhật khóa học")
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-full bg-background">
        <div className="max-w-5xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="p-4 sm:p-6 space-y-6 min-h-full bg-background">
        <div className="max-w-5xl mx-auto space-y-6">
          <PageHeader courseId={courseId} />
          <ErrorState courseId={courseId} onRetry={fetchCourse} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <PageHeader courseId={courseId} />

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
              onClick={() => router.push(`/instructor/courses/${courseId}`)}
              className="sm:flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="sm:flex-1"
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật khóa học"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
