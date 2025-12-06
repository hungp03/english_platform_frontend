"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Eye, Receipt } from "lucide-react"
import Link from "next/link"
import { formatDate, formatCurrency } from "@/lib/utils"

const OrderCard = ({ order }) => {
  const getShortCode = (orderId) => {
    return orderId.slice(-6).toUpperCase()
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "PAID":
        return "default"
      case "PENDING":
        return "secondary"
      case "CANCELLED":
        return "destructive"
      case "REFUNDED":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "PAID":
        return "Đã thanh toán"
      case "PENDING":
        return "Chờ thanh toán"
      case "CANCELLED":
        return "Đã hủy"
      // case "REFUNDED":
      //   return "Đã hoàn tiền"
      default:
        return "Không xác định"
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-mono text-sm font-medium">{getShortCode(order.id)}</div>
          <div className="text-xs text-gray-500">{order.id}</div>
        </div>
        <Badge variant={getStatusVariant(order.status)}>
          {getStatusText(order.status)}
        </Badge>
      </div>

      <div className="space-y-2">
        <div>
          <div className="font-medium">{order.itemCount} sản phẩm</div>
          <div className="text-xs text-gray-500">{order.currency}</div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="font-medium">
            {formatCurrency(order.totalCents)}
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <Link href={`/account/orders/${order.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              Chi tiết
            </Button>
          </Link>
          {order.status === 'PAID' && (
            <Link href={`/account/invoices/INV${order.id}`}>
              <Button variant="outline" size="sm" title="Xem hóa đơn">
                <Receipt className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderCard