"use client"

import Link from "next/link"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"

export default function CartSummary({ summary }) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Tóm tắt đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Số lượng khóa học:</span>
          <span className="font-medium">{summary.totalPublishedCourses}</span>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Tổng cộng:</span>
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(summary.totalPriceCents, summary.currency)}
          </span>
        </div>

        <div className="text-xs text-gray-500">
          <p>• Giá đã bao gồm VAT</p>
          <p>• Truy cập vĩnh viễn vào khóa học</p>
          <p>• Chứng nhận hoàn thành</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Link className="w-full flex items-center space-x-2" href={"/payment/checkout"}>
          <Button className="w-full"
            size="lg"
          >
            <CreditCard className="h-5 w-5" />
            <span>Thanh toán ngay</span>
          </Button>
        </Link>
        <Link href="/courses" className="w-full">
          <Button variant="outline" className="w-full">
            Tiếp tục mua sắm
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}