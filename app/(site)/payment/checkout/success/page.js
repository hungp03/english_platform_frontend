"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { CheckCircle2, Home, Package, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto w-full">
        <Card className="shadow-lg">
          <CardContent className="p-8 md:p-12">
            {/* Success Icon and Message */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </h1>
              <p className="text-lg text-gray-600">
                Cảm ơn bạn đã tin tưởng và mua khóa học của chúng tôi.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Bạn sẽ nhận được email xác nhận đơn hàng trong vài phút tới.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Receipt className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Thông tin đơn hàng
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {orderId ? `#${orderId}` : '#Đang xử lý...'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Đã thanh toán
                  </span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Tiếp theo là gì?
                </h2>
              </div>

              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Nhận email xác nhận với chi tiết đơn hàng</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Truy cập ngay vào khóa học của bạn</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Bắt đầu hành trình học tiếng Anh</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                className="flex-1"
                size="lg"
              >
                <Link href="/my-courses" className="flex items-center justify-center">
                  <Package className="w-5 h-5 mr-2" />
                  Xem khóa học của tôi
                </Link>
              </Button>

              <Button
                variant="outline"
                asChild
                className="flex-1"
                size="lg"
              >
                <Link href="/" className="flex items-center justify-center">
                  <Home className="w-5 h-5 mr-2" />
                  Về trang chủ
                </Link>
              </Button>
            </div>

            {/* Support Information */}
            <div className="mt-8 pt-8 border-t text-center">
              <p className="text-sm text-gray-600 mb-2">
                Cần hỗ trợ?
              </p>
              <Link
                href="/contact"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Liên hệ với đội ngũ hỗ trợ của chúng tôi
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto w-full">
          <Card className="shadow-lg">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}