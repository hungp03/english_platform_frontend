"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Tag, Percent, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { getCourseVouchers } from "@/lib/api/voucher"

export default function CourseVouchers({ courseId }) {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const result = await getCourseVouchers(courseId, 1, 3)
        if (result.success) {
          setVouchers(result.data.result || [])
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchVouchers()
    }
  }, [courseId])

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã: ${code}`)
  }

  const formatDiscount = (voucher) => {
    if (voucher.discountType === "PERCENTAGE") {
      return `${voucher.discountValue}%`
    } else {
      return `${voucher.discountValue.toLocaleString()}đ`
    }
  }

  if (loading || vouchers.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="w-5 h-5 text-green-600" />
          Khuyến mãi có sẵn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border-green-200"
          >
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full flex-shrink-0">
                {voucher.discountType === "PERCENTAGE" ? (
                  <Percent className="w-5 h-5 text-green-600" />
                ) : (
                  <DollarSign className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs sm:text-sm">
                    {voucher.code}
                  </Badge>
                  <Badge variant="outline" className="text-green-700 bg-green-100 text-xs sm:text-sm">
                    Giảm {formatDiscount(voucher)}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {voucher.minOrderAmount > 0 && (
                    <>Đơn tối thiểu {voucher.minOrderAmount.toLocaleString()}đ • </>
                  )}
                  Có hiệu lực đến {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyVoucherCode(voucher.code)}
              className="flex items-center justify-center gap-1 w-full sm:w-auto"
            >
              <Copy className="w-4 h-4" />
              <span className="sm:inline">Sao chép</span>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
