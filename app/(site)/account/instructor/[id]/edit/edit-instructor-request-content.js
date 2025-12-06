"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getInstructorRequestsByUserAndId } from "@/lib/api/instructor"
import { useInstructorRequestForm } from "@/hooks/use-instructor-request-form"
import { useCertificateProofs } from "@/hooks/use-certificate-proofs"
import { getStatusVariant, getStatusText } from "@/components/instructor/update-request/status-utils"
import { ReadOnlyBanner } from "@/components/instructor/update-request/read-only-banner"
import { DeleteRequestDialog } from "@/components/instructor/update-request/delete-request-dialog"
import { FormActionButtons } from "@/components/instructor/update-request/form-action-buttons"
import RequestInfoHeader from "@/components/instructor/update-request/request-info-header"
import PersonalInfoDisplay from "@/components/instructor/update-request/personal-info-display"
import ProfessionalInfoForm from "@/components/instructor/update-request/professional-info-form"
import CertificateProofsManager from "@/components/instructor/update-request/certificate-proofs-manager"
import LoadingSpinner from "@/components/instructor/update-request/loading-spinner"
import ErrorMessage from "@/components/instructor/update-request/error-message"

const EditInstructorRequestContent = ({ requestId }) => {
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [requestData, setRequestData] = useState(null)

  const {
    formData,
    setFormData,
    saving,
    deleting,
    handleInputChange,
    handleBioChange,
    handleSubmit,
    handleDeleteRequest: deleteRequest
  } = useInstructorRequestForm(requestId)

  const {
    certificateProofs,
    setCertificateProofs,
    uploadingProofs,
    transformProofs,
    handleFileUpload,
    handleSaveProofs,
    handleRemoveProof,
    handleOpenProof
  } = useCertificateProofs(requestId)

  useEffect(() => {
    fetchRequestData()
  }, [requestId])

  const fetchRequestData = async () => {
    try {
      setLoading(true)
      const result = await getInstructorRequestsByUserAndId(requestId)

      if (!result.success) {
        toast.error(result.error || "Không thể tải thông tin yêu cầu")
        return
      }

      const data = result.data
      setRequestData(data)

      setCertificateProofs(transformProofs(data.certificateProofs))
      setFormData({
        bio: data.bio || "",
        expertise: data.expertise || "",
        experienceYears: data.experienceYears?.toString() || "",
        qualification: data.qualification || "",
        reason: data.reason || ""
      })
    } catch (error) {
      console.error("Error fetching request data:", error)
      toast.error("Không thể tải thông tin yêu cầu")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = () => {
    deleteRequest()
    setShowDeleteDialog(false)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!requestData) {
    return <ErrorMessage />
  }

  const isReadOnly = requestData.status !== "PENDING"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <RequestInfoHeader
            requestId={requestId}
            requestData={requestData}
            getStatusVariant={getStatusVariant}
            getStatusText={getStatusText}
          />

          {isReadOnly && <ReadOnlyBanner />}

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                {isReadOnly ? "Thông tin yêu cầu" : "Chỉnh sửa thông tin yêu cầu"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <PersonalInfoDisplay
                  fullName={requestData.fullName}
                  email={requestData.email}
                />

                <Separator />

                <ProfessionalInfoForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleBioChange={handleBioChange}
                  isReadOnly={isReadOnly}
                />

                <Separator />

                <CertificateProofsManager
                  certificateProofs={certificateProofs}
                  handleFileUpload={handleFileUpload}
                  handleSaveProofs={handleSaveProofs}
                  handleRemoveProof={handleRemoveProof}
                  handleOpenProof={handleOpenProof}
                  uploadingProofs={uploadingProofs}
                  isReadOnly={isReadOnly}
                />

                <FormActionButtons
                  isReadOnly={isReadOnly}
                  saving={saving}
                  onDelete={() => setShowDeleteDialog(true)}
                />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteRequestDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteRequest}
        deleting={deleting}
      />
    </div>
  )
}

export default EditInstructorRequestContent