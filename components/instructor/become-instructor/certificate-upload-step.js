import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, CheckCircle, ArrowLeft, Award, Loader2 } from "lucide-react"

export const CertificateUploadStep = ({
  uploadedFiles,
  certificateProofs,
  loading,
  onFileUpload,
  onSaveCertificates,
  onRemoveFile,
  onBack,
  onFinish
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Bước 2: Tải lên chứng chỉ (tùy chọn)
        </CardTitle>
        <p className="text-sm text-gray-600">
          Nếu bạn có chứng chỉ giảng dạy hoặc bằng cấp liên quan, vui lòng tải lên để tăng cơ hội được duyệt.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">Tải lên chứng chỉ</p>
            <p className="text-sm text-gray-500">PDF, JPG, PNG, WebP (tối đa 5MB mỗi file)</p>
          </div>
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={onFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              variant="outline"
              className="mt-4 cursor-pointer"
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Chọn file
              </span>
            </Button>
          </label>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">File đã tải lên</h4>
              {uploadedFiles.some(file => !file.uploaded) && (
                <Button
                  size="sm"
                  onClick={onSaveCertificates}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Lưu tất cả chứng chỉ
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={file.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.uploaded ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Đã lưu
                      </Badge>
                    ) : file.isPreview ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Bản xem trước
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Chưa lưu
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveFile(file.id || file.url)}
                      disabled={loading}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Certificate Proofs */}
        {certificateProofs.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h4 className="font-medium text-gray-900">Chứng chỉ đã lưu ({certificateProofs.length})</h4>
            <div className="space-y-2">
              {certificateProofs.map((proof, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{proof.fileName}</p>
                    <p className="text-xs text-gray-500">
                      Đã lưu vào {new Date(proof.uploadedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <Badge variant="default">Đã lưu</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <Button onClick={onFinish}>
            Hoàn thành
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}