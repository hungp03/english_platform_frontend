"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { XCircle, RefreshCw, ShoppingCart, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function CheckoutCancelContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetryPayment = () => {
    setIsRetrying(true)
    window.location.href = "/payment/checkout"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md mx-auto w-full">
        <Card className="shadow-lg">
          <CardContent className="p-8 md:p-10 text-center">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán chưa thành công
              </h1>
              <p className="text-gray-600">
                Đơn hàng của bạn hiện chưa được thanh toán.
                <br />
                Vui lòng thử lại hoặc liên hệ hỗ trợ nếu gặp sự cố.
              </p>
              {orderId && (
                <p className="mt-3 text-sm text-gray-500">
                  Mã đơn hàng: <span className="font-mono">#{orderId}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                onClick={handleRetryPayment}
                className="flex-1"
                size="lg"
                disabled={isRetrying}
              >
                <RefreshCw
                  className={`w-5 h-5 mr-2 ${isRetrying ? "animate-spin" : ""}`}
                />
                {isRetrying ? "Đang chuyển hướng..." : "Thử lại thanh toán"}
              </Button>

              <Button variant="outline" asChild className="flex-1" size="lg">
                <Link href="/cart" className="flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Giỏ hàng
                </Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button variant="secondary" asChild className="flex-1" size="lg">
                <Link href="/" className="flex items-center justify-center">
                  <Home className="w-5 h-5 mr-2" />
                  Trang chủ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md mx-auto w-full">
          <Card className="shadow-lg">
            <CardContent className="p-8 md:p-10 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <CheckoutCancelContent />
    </Suspense>
  )
}
