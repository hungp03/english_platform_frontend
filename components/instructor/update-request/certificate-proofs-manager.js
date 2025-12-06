import { Button } from "@/components/ui/button"
import { FileText, Upload, Loader2, ExternalLink, Trash2 } from "lucide-react"

const CertificateProofsManager = ({
  certificateProofs,
  handleFileUpload,
  handleSaveProofs,
  handleRemoveProof,
  handleOpenProof,
  uploadingProofs,
  isReadOnly = false
}) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Chứng chỉ đính kèm ({certificateProofs.length})
      </h4>

      {/* Upload Area */}
      {!isReadOnly && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">Tải lên chứng chỉ</p>
            <p className="text-sm text-gray-500">PDF, JPG, PNG, WebP (tối đa 5MB mỗi file)</p>
          </div>
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="proof-upload"
            ref={(input) => {
              if (input) {
                input.value = '';
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-4 cursor-pointer"
            onClick={() => {
              const fileInput = document.getElementById('proof-upload');
              if (fileInput) {
                fileInput.click();
              }
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Chọn file
          </Button>
        </div>
      )}

      {/* Certificate Proofs List */}
      {certificateProofs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700">Danh sách chứng chỉ</h5>
            {!isReadOnly && certificateProofs.some(proof => !proof.uploaded) && (
              <Button
                type="button"
                size="sm"
                onClick={handleSaveProofs}
                disabled={uploadingProofs}
              >
                {uploadingProofs ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    Lưu tất cả
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {certificateProofs.map((proof) => (
              <div key={proof.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{proof.name}</p>
                    {!isReadOnly && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {proof.uploaded ? (
                          <span className="text-green-600">Đã lưu</span>
                        ) : (
                          <span className="text-yellow-600">Chưa lưu</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {proof.uploaded && proof.url && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenProof(proof)}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                  {!isReadOnly && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveProof(proof.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CertificateProofsManager
