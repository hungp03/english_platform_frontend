"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Calendar, User, BookOpen, Award, MessageSquare, CheckCircle, XCircle, Clock, FileText, Edit } from "lucide-react"
import { getUserInstructorRequests } from "@/lib/api/instructor"
import { toast } from "sonner"
import Link from "next/link"
import { EvidenceDialog } from "@/components/instructor/evidence/evidence-dialog"

const getStatusVariant = (status) => {
  switch (status) {
    case "APPROVED": return "default"
    case "REJECTED": return "destructive"
    case "PENDING": return "secondary"
    default: return "outline"
  }
}

const getStatusText = (status) => {
  switch (status) {
    case "APPROVED": return "Đã duyệt"
    case "REJECTED": return "Đã từ chối"
    case "PENDING": return "Chờ duyệt"
    default: return "Không xác định"
  }
}

const StatusIcon = memo(({ status }) => {
  switch (status) {
    case "APPROVED": return <CheckCircle className="w-4 h-4 text-green-500" />
    case "REJECTED": return <XCircle className="w-4 h-4 text-red-500" />
    case "PENDING": return <Clock className="w-4 h-4 text-yellow-500" />
    default: return <Clock className="w-4 h-4 text-gray-500" />
  }
})
StatusIcon.displayName = "StatusIcon"

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const RequestCard = memo(({ request, onViewEvidence }) => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon status={request.status} />
            <Badge variant={getStatusVariant(request.status)}>
              {getStatusText(request.status)}
            </Badge>
          </div>
          <CardTitle className="text-xl">Yêu cầu #{request.id.slice(-8).toUpperCase()}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Ngày gửi: {formatDate(request.requestedAt)}</span>
            </div>
            {request.reviewedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Xem xét: {formatDate(request.reviewedAt)}</span>
              </div>
            )}
          </div>
        </div>
        <Link href={`/account/instructor/${request.id}/edit`}>
          <Button size="sm" variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </Link>
      </div>
    </CardHeader>

    <CardContent className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Thông tin cá nhân
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Họ và tên:</span>
            <p className="text-gray-600">{request.fullName}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Email:</span>
            <p className="text-gray-600">{request.email}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          Thông tin chuyên môn
        </h4>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Kinh nghiệm:</span>
            <p className="text-gray-600">{request.experienceYears} năm</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Chuyên môn:</span>
            <p className="text-gray-600">{request.expertise}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Bằng cấp:</span>
            <p className="text-gray-600">{request.qualification}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Giới thiệu và lý do
        </h4>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Tiểu sử:</span>
            <div
              className="text-gray-600 mt-1 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: request.bio }}
            />
          </div>
          <div>
            <span className="font-medium text-gray-700">Lý do muốn trở thành giảng viên:</span>
            <p className="text-gray-600 mt-1">{request.reason}</p>
          </div>
        </div>
      </div>

      {request.adminNotes && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Đánh giá từ quản trị viên
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">{request.adminNotes}</p>
              {request.reviewedByName && (
                <p className="text-xs text-gray-500">- {request.reviewedByName}</p>
              )}
            </div>
          </div>
        </>
      )}

      {request.certificateProofs && request.certificateProofs.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Chứng chỉ đính kèm ({request.certificateProofs.length})
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {request.certificateProofs.length} chứng chỉ đã tải lên
                    </p>
                    <p className="text-xs text-gray-500">
                      Tải lên vào {new Date(request.certificateProofs[0]?.uploadedAt || request.requestedAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => onViewEvidence(request)}>
                  Xem tất cả
                </Button>
              </div>

              <div className="text-center">
                <Button size="sm" variant="outline" onClick={() => onViewEvidence(request)}>
                  Xem tất cả {request.certificateProofs.length} chứng chỉ
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </CardContent>
  </Card>
))
RequestCard.displayName = "RequestCard"

const InstructorRequestsContent = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    const fetchInstructorRequests = async () => {
      try {
        const result = await getUserInstructorRequests()
        if (result.success) {
          setRequests(result.data || [])
        } else {
          toast.error(result.error || "Không thể tải danh sách yêu cầu")
        }
      } catch (error) {
        console.error("Error fetching instructor requests:", error)
        toast.error("Có lỗi xảy ra khi tải danh sách yêu cầu")
      } finally {
        setLoading(false)
      }
    }
    fetchInstructorRequests()
  }, [])

  const handleViewEvidence = useCallback((request) => {
    setSelectedRequest(request)
    setEvidenceDialogOpen(true)
  }, [])

  const evidenceData = useMemo(() => ({
    evidence: selectedRequest?.certificateProofs || [],
    requestId: selectedRequest?.id
  }), [selectedRequest])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Đang tải danh sách yêu cầu...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Yêu cầu trở thành giảng viên</h1>
              <Link href="/account">
                <Button variant="outline">Quay lại tài khoản</Button>
              </Link>
            </div>
            <p className="text-gray-600">Xem lịch sử các yêu cầu trở thành giảng viên của bạn</p>
          </div>

          {requests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-500 mb-4">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có yêu cầu nào</h3>
                <p className="text-gray-600 mb-6">Bạn chưa gửi yêu cầu trở thành giảng viên nào.</p>
                <Link href="/become-instructor">
                  <Button>Gửi yêu cầu ngay</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} onViewEvidence={handleViewEvidence} />
              ))}

              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600 mb-4">Muốn gửi yêu cầu mới?</p>
                  <Link href="/become-instructor">
                    <Button variant="outline">Gửi yêu cầu mới</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <EvidenceDialog
        open={evidenceDialogOpen}
        onOpenChange={setEvidenceDialogOpen}
        evidence={evidenceData.evidence}
        requestId={evidenceData.requestId}
      />
    </div>
  )
}

export default InstructorRequestsContent