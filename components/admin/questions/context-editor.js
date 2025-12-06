import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Editor from "@/components/content/editor";

export default function ContextEditor({ 
  contextText, 
  onContextChange, 
  onSave, 
  saving, 
  loading, 
  folderPath 
}) {
  return (
    <Card className="h-fit gap-2 border-gray-200">
      <CardHeader className=" border-b border-gray-200">
        <CardTitle className="text-sm font-semibold text-gray-700">Đoạn văn/Ngữ cảnh chung</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
            <span className="ml-3 text-sm text-gray-600">Đang tải...</span>
          </div>
        ) : (
          <>
            <div className="border border-gray-200 rounded overflow-hidden">
              <Editor
                initialContent={contextText}
                onContentChange={onContextChange}
                useServerUpload={true}
                uploadFolder={folderPath}
              />
            </div>

            <div className="mt-3">
              <Button 
                onClick={onSave} 
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>

            <div className="mt-3 bg-blue-50 rounded border border-blue-200 p-3">
              <p className="text-xs font-medium text-blue-900 mb-2">
                Hướng dẫn sử dụng Editor
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li><strong>Ảnh:</strong> Click nút Image → Chọn file → Tự động upload lên S3</li>
                <li><strong>Audio:</strong> Click nút Audio → Chọn file audio → Upload lên S3</li>
                <li><strong>Resize:</strong> Click vào ảnh đã chèn → Chọn kích thước hoặc căn lề</li>
                <li><strong>Folder:</strong> <code className="bg-blue-100 px-1 rounded text-xs">{folderPath}</code></li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
