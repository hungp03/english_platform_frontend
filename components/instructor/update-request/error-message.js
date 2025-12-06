import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const ErrorMessage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy yêu cầu</h2>
            <p className="text-gray-600 mb-6">Yêu cầu bạn đang tìm không tồn tại.</p>
            <Link href="/account/instructor">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage
