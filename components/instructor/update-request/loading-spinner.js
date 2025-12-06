import { Loader2 } from "lucide-react"

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Đang tải thông tin yêu cầu...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
