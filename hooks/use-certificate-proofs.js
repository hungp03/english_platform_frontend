import { useState } from "react"
import { toast } from "sonner"
import { uploadProofs, uploadCertificateProofs, deleteCertificateProof } from "@/lib/api/instructor"

export const useCertificateProofs = (requestId) => {
  const [certificateProofs, setCertificateProofs] = useState([])
  const [uploadingProofs, setUploadingProofs] = useState(false)

  const transformProofs = (proofsData) => {
    return (proofsData || []).map(proof => ({
      ...proof,
      name: proof.fileUrl ? proof.fileUrl.split('/').pop() : 'Chứng chỉ',
      size: 0,
      uploaded: true,
      url: proof.fileUrl
    }))
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
    const maxSize = 5 * 1024 * 1024

    const validFiles = []
    const invalidFiles = []

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} (loại file không được hỗ trợ)`)
        return
      }

      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (quá 5MB)`)
        return
      }

      validFiles.push(file)
    })

    if (invalidFiles.length > 0) {
      toast.error(`File không hợp lệ: ${invalidFiles.join(', ')}`)
      return
    }

    if (validFiles.length === 0) {
      toast.error('Không có file hợp lệ nào được chọn')
      return
    }

    const newProofs = validFiles.map((file, index) => ({
      id: `preview-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      url: null,
      uploaded: false,
      isPreview: true
    }))

    setCertificateProofs(prev => [...prev, ...newProofs])
    toast.success(`Đã thêm ${validFiles.length} chứng chỉ vào danh sách`)
  }

  const handleSaveProofs = async () => {
    const unsavedProofs = certificateProofs.filter(proof => !proof.uploaded)
    if (unsavedProofs.length === 0) {
      toast.info("Không có chứng chỉ nào cần lưu")
      return
    }

    try {
      setUploadingProofs(true)

      const filesToUpload = unsavedProofs.map(p => p.file)
      const uploadResult = await uploadProofs(filesToUpload)

      if (!uploadResult.success) {
        toast.error(uploadResult.error || "Tải lên file thất bại")
        return
      }

      const fileUrls = uploadResult.data.map(file => file.url)
      const certificateResult = await uploadCertificateProofs(requestId, fileUrls)

      if (!certificateResult.success) {
        toast.error(certificateResult.error || "Lưu chứng chỉ thất bại")
        return
      }

      const updatedProofs = certificateProofs.map(proof => {
        const matchingFile = uploadResult.data.find(file =>
          unsavedProofs.some(unsaved => unsaved.id === proof.id && unsaved.name === file.originalName)
        )

        if (matchingFile) {
          return {
            ...proof,
            url: matchingFile.url,
            uploaded: true,
            isPreview: false
          }
        }
        return proof
      })

      setCertificateProofs(updatedProofs)
      toast.success(`Đã lưu thành công ${unsavedProofs.length} chứng chỉ`)
    } catch (error) {
      console.error("Error saving proofs:", error)
      toast.error("Có lỗi xảy ra khi lưu chứng chỉ")
    } finally {
      setUploadingProofs(false)
    }
  }

  const handleRemoveProof = async (proofId) => {
    const proofToRemove = certificateProofs.find(p => p.id === proofId)
    
    if (proofToRemove && proofToRemove.uploaded && !proofToRemove.isPreview) {
      try {
        const result = await deleteCertificateProof(requestId, proofId)
        
        if (!result.success) {
          toast.error(result.error || "Xóa chứng chỉ thất bại")
          return
        }
        
        setCertificateProofs(prev => prev.filter(p => p.id !== proofId))
        toast.success("Đã xóa chứng chỉ")
      } catch (error) {
        console.error("Error deleting proof:", error)
        toast.error("Có lỗi xảy ra khi xóa chứng chỉ")
      }
    } else {
      setCertificateProofs(prev => prev.filter(p => p.id !== proofId))
      toast.success("Đã xóa chứng chỉ")
    }
  }

  const handleOpenProof = (proof) => {
    if (proof.url) {
      window.open(proof.url, '_blank', 'noopener,noreferrer')
    } else {
      toast.error("Chứng chỉ chưa được tải lên")
    }
  }

  return {
    certificateProofs,
    setCertificateProofs,
    uploadingProofs,
    transformProofs,
    handleFileUpload,
    handleSaveProofs,
    handleRemoveProof,
    handleOpenProof
  }
}
