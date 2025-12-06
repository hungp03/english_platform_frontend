import { memo } from "react"
import { Calendar, Receipt } from "lucide-react"

export const OrderInfo = memo(function OrderInfo({ orderDetails, formatDate }) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <Receipt className="w-4 h-4" />
        Chi tiết đơn hàng
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground block">Mã đơn hàng</span>
          <span className="font-mono font-medium text-xs">{orderDetails.id}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Ngày đặt</span>
          <span className="font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(orderDetails.createdAt)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">Thanh toán</span>
          <span className="font-medium">
            {orderDetails.paidAt ? formatDate(orderDetails.paidAt) : "Chưa thanh toán"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">Số sản phẩm</span>
          <span className="font-medium">{orderDetails.items?.length || 0}</span>
        </div>
      </div>
    </div>
  )
})