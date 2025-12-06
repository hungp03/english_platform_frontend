"use client"

import Link from "next/link"
import { Plus, ShoppingCart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function EmptyCart() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Tiếp tục mua sắm</span>
            </Button>
          </Link>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Giỏ hàng trống
                </h2>
                <p className="text-gray-600 mb-6">
                  Bạn chưa thêm khóa học nào vào giỏ hàng
                </p>
              </div>
              <Link href="/courses">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Khám phá khóa học</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}