"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Eye, Receipt } from "lucide-react"
import Link from "next/link"
import { formatDate, formatCurrency } from "@/lib/utils"

const OrdersTable = ({ orders }) => {
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
    <div className="hidden lg:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Mã đơn hàng</TableHead>
            <TableHead className="text-center">Số lượng</TableHead>
            <TableHead className="text-center">Thời gian đặt</TableHead>
            <TableHead className="text-center">Tổng tiền</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="text-center">
                <div>
                  <div className="font-mono text-sm font-medium">{getShortCode(order.id)}</div>
                  <div className="text-xs text-gray-500">{order.id}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <div className="font-medium truncate">{order.itemCount} sản phẩm</div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{formatDate(order.createdAt)}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="font-medium">
                  {formatCurrency(order.totalCents)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Badge variant={getStatusVariant(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Link href={`/account/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Chi tiết
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default OrdersTable