"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { createInstructorRequest, uploadProofs, uploadCertificateProofs } from "@/lib/api/instructor"
import { createInstructorRequestSchema } from "@/schema/instructor"
import { Header } from "@/components/instructor/become-instructor/header"
import { ProgressIndicator } from "@/components/instructor/become-instructor/progress-indicator"
import { BasicInformationStep } from "@/components/instructor/become-instructor/basic-information-step"
import { CertificateUploadStep } from "@/components/instructor/become-instructor/certificate-upload-step"

const BecomeInstructorContent = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [requestId, setRequestId] = useState(null)

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm({
    resolver: zodResolver(createInstructorRequestSchema),
    mode: 'onChange'
  })

  // File uploads for Step 2
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [certificateProofs, setCertificateProofs] = useState([])

  // State for rich text editor bio content
  const [bioContent, setBioContent] = useState("")

  const handleBioChange = useCallback((content) => {
    setBioContent(content)
    setValue('bio', content, { shouldValidate: true })
  }, [setValue])

  const handleStep1Submit = useCallback(async (data) => {
    try {
      setLoading(true)
      const result = await createInstructorRequest({
        bio: data.bio?.trim() || bioContent.trim(),
        expertise: data.expertise?.trim() || '',
        experienceYears: Number.isNaN(data.experienceYears) ? 0 : parseInt(data.experienceYears),
        qualification: data.qualification?.trim() || '',
        reason: data.reason?.trim() || ''
      })

      if (result.success) {
        setRequestId(result.data.id)
        toast.success("Tạo yêu cầu thành công! Vui lòng tải lên chứng chỉ nếu có.")
        setCurrentStep(2)
      } else {
        toast.error(result.error || "Tạo yêu cầu thất bại")
      }
    } catch (error) {
      console.error("Error creating instructor request:", error)
      toast.error(error.message || "Có lỗi xảy ra khi tạo yêu cầu")
    } finally {
      setLoading(false)
    }
  }, [bioContent])

  const handleFileUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Define allowed MIME types and max size (5MB)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes

    // Validate files
    const validFiles = []
    const invalidFiles = []

    files.forEach(file => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} (loại file không được hỗ trợ)`)
        return
      }

      // Check file size
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (quá 5MB)`)
        return
      }

      validFiles.push(file)
    })

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      toast.error(`File không hợp lệ: ${invalidFiles.join(', ')}`)
      return
    }

    if (validFiles.length === 0) {
      toast.error('Không có file hợp lệ nào được chọn')
      return
    }

    // Create local previews without uploading to server
    const newFiles = validFiles.map((file) => ({
      id: `preview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file, // Store the actual File object for later upload
      url: null, // Will be set when actually uploaded
      uploaded: false,
      isPreview: true
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    toast.success(`Đã thêm ${validFiles.length} file vào danh sách`)
  }, [uploadedFiles])

  const handleSaveCertificates = useCallback(async () => {
    if (!requestId) {
      toast.error("Không tìm thấy ID yêu cầu")
      return
    }

    const unsavedFiles = uploadedFiles.filter(file => !file.uploaded)
    if (unsavedFiles.length === 0) {
      toast.info("Không có file nào cần lưu")
      return
    }

    try {
      setLoading(true)

      // Step 1: Upload files to get URLs
      const filesToUpload = unsavedFiles.map(f => f.file)
      const uploadResult = await uploadProofs(filesToUpload)

      if (!uploadResult.success) {
        toast.error(uploadResult.error || "Tải lên file thất bại")
        return
      }

      // Step 2: Save certificate proofs with uploaded URLs
      const fileUrls = uploadResult.data.map(file => file.url)
      const saveResult = await uploadCertificateProofs(requestId, fileUrls)

      if (saveResult.success) {
        // Update uploaded files with server URLs and mark as uploaded
        const updatedFiles = uploadedFiles.map(file => {
          const uploadedFile = unsavedFiles.find(f => f.id === file.id)
          if (uploadedFile) {
            const serverFile = uploadResult.data.find((sf, index) =>
              sf.fileName === uploadedFile.name
            )
            if (serverFile) {
              return { ...file, url: serverFile.url, uploaded: true, isPreview: false }
            }
          }
          return file
        })

        setUploadedFiles(updatedFiles)

        // Add new certificate proofs
        const newProofs = saveResult.data.map((proof, index) => ({
          id: proof.id,
          fileUrl: proof.fileUrl,
          fileName: uploadResult.data[index]?.fileName || 'Unknown',
          uploadedAt: proof.uploadedAt
        }))

        setCertificateProofs(prev => [...prev, ...newProofs])

        toast.success(`Lưu thành công ${newProofs.length} chứng chỉ`)
      } else {
        toast.error(saveResult.error || "Lưu chứng chỉ thất bại")
      }
    } catch (error) {
      console.error("Error saving certificate proofs:", error)
      toast.error("Có lỗi xảy ra khi lưu chứng chỉ")
    } finally {
      setLoading(false)
    }
  }, [requestId, uploadedFiles])

  const handleFinish = useCallback(() => {
    toast.success("Hoàn thành đăng ký trở thành giảng viên!")
    router.push("/account/instructor")
  }, [router])

  const removeFile = useCallback((fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    // Also remove from certificate proofs if it was already uploaded
    const fileToRemove = uploadedFiles.find(f => f.id === fileId)
    if (fileToRemove?.url && certificateProofs.some(cp => cp.fileUrl === fileToRemove.url)) {
      setCertificateProofs(prev => prev.filter(cp => cp.fileUrl !== fileToRemove.url))
    }
  }, [uploadedFiles, certificateProofs])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Header />
          <ProgressIndicator currentStep={currentStep} />

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <BasicInformationStep
              register={register}
              errors={errors}
              handleSubmit={handleSubmit(handleStep1Submit)}
              loading={loading}
              onBioChange={handleBioChange}
              bioValue={bioContent}
            />
          )}

          {/* Step 2: Upload Certificate Proof */}
          {currentStep === 2 && (
            <CertificateUploadStep
              uploadedFiles={uploadedFiles}
              certificateProofs={certificateProofs}
              loading={loading}
              onFileUpload={handleFileUpload}
              onSaveCertificates={handleSaveCertificates}
              onRemoveFile={removeFile}
              onBack={() => setCurrentStep(1)}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default BecomeInstructorContent