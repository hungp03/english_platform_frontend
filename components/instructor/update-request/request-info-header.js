import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar } from "lucide-react"

const RequestInfoHeader = ({ requestId, requestData, getStatusVariant, getStatusText }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa yêu cầu giảng viên</h1>
          <p className="text-gray-600 mt-2">Cập nhật thông tin yêu cầu trở thành giảng viên của bạn</p>
        </div>
        <Link href="/account/instructor">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="font-medium">Yêu cầu:</span>
          <span>#{requestId.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Ngày gửi: {new Date(requestData.requestedAt).toLocaleDateString('vi-VN')}</span>
        </div>
        <Badge variant={getStatusVariant(requestData.status)}>
          {getStatusText(requestData.status)}
        </Badge>
      </div>
    </div>
  )
}

export default RequestInfoHeader
