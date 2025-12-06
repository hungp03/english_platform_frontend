"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, HelpCircle, Home } from "lucide-react"

export default function AuthFailedPage() {
  const router = useRouter()
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* background blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl"></div>

      {/* card */}
      <div
        className={`relative max-w-lg w-full transition-all duration-700 ${
          isAnimated ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-6">
            {/* icon */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>

            {/* title + description */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Xác thực thất bại
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Đã xảy ra lỗi trong quá trình xác thực tài khoản. Vui lòng thử lại sau.
              </p>
            </div>

            {/* tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2 text-yellow-800">
                <HelpCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Nguyên nhân thường gặp:</span>
              </div>
              <ul className="text-xs text-yellow-700 space-y-1 text-left">
                <li>• Quy trình xác thực bị hủy bỏ</li>
                <li>• Tài khoản đã được xác thực</li>
              </ul>
            </div>

            {/* back button */}
            <div className="grid items-center">
              <Button onClick={() => router.push("/")} variant="outline">
                <Home className="w-4 h-4 mr-1" />
                Quay về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
