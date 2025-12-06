"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText, Calendar } from "lucide-react"

export const EvidenceDialog = ({ open, onOpenChange, evidence, requestId }) => {

  const getFileIcon = (fileUrl) => {
    const extension = fileUrl?.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
      return <FileText className="w-4 h-4" />
    }
    return <FileText className="w-4 h-4" />
  }

  const getFileType = (fileUrl) => {
    const extension = fileUrl?.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
      return "Hình ảnh"
    }
    if (extension === 'pdf') {
      return "PDF"
    }
    return "Tài liệu"
  }

  const formatFileSize = (url) => {
    // This is a rough estimate since we don't have the actual file size
    // In a real implementation, you might want to fetch file metadata
    return "Chưa xác định"
  }

  const handleOpenInNewTab = (fileUrl) => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Chứng chỉ yêu cầu #{requestId?.slice(-8).toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Quản lý các chứng chỉ đã tải lên cho yêu cầu trở thành giảng viên này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Evidence List */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Danh sách chứng chỉ ({evidence?.length || 0})</h4>

            {evidence?.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">Chưa có chứng chỉ nào được tải lên</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {evidence?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getFileIcon(item.fileUrl)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getFileType(item.fileUrl)} #{item.id.slice(-8).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.uploadedAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {getFileType(item.fileUrl)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleOpenInNewTab(item.fileUrl)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Mở
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}