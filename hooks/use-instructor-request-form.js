import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateInstructorRequest, deleteInstructorRequest } from "@/lib/api/instructor"

export const useInstructorRequestForm = (requestId) => {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    bio: "",
    expertise: "",
    experienceYears: "",
    qualification: "",
    reason: ""
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBioChange = (content) => {
    setFormData(prev => ({
      ...prev,
      bio: content
    }))
  }

  const validateForm = () => {
    if (!formData.bio.trim()) {
      toast.error("Vui lòng nhập tiểu sử")
      return false
    }
    if (!formData.expertise.trim()) {
      toast.error("Vui lòng nhập chuyên môn")
      return false
    }
    if (!formData.experienceYears || formData.experienceYears <= 0) {
      toast.error("Vui lòng nhập số năm kinh nghiệm hợp lệ")
      return false
    }
    if (!formData.qualification.trim()) {
      toast.error("Vui lòng nhập bằng cấp")
      return false
    }
    if (!formData.reason.trim()) {
      toast.error("Vui lòng nhập lý do")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSaving(true)

      const result = await updateInstructorRequest({
        requestId,
        bio: formData.bio,
        expertise: formData.expertise,
        experienceYears: parseInt(formData.experienceYears),
        qualification: formData.qualification,
        reason: formData.reason
      })

      if (!result.success) {
        toast.error(result.error || "Có lỗi xảy ra khi cập nhật yêu cầu")
        return
      }

      toast.success("Cập nhật yêu cầu thành công")
      router.push("/account/instructor")
    } catch (error) {
      console.error("Error updating request:", error)
      toast.error("Có lỗi xảy ra khi cập nhật yêu cầu")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRequest = async () => {
    try {
      setDeleting(true)
      const result = await deleteInstructorRequest(requestId)

      if (!result.success) {
        toast.error(result.error || "Xóa yêu cầu thất bại")
        return
      }

      toast.success("Đã xóa yêu cầu thành công")
      router.push("/account/instructor")
    } catch (error) {
      console.error("Error deleting request:", error)
      toast.error("Có lỗi xảy ra khi xóa yêu cầu")
    } finally {
      setDeleting(false)
    }
  }

  return {
    formData,
    setFormData,
    saving,
    deleting,
    handleInputChange,
    handleBioChange,
    handleSubmit,
    handleDeleteRequest
  }
}
