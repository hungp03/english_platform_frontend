import { memo } from "react"
import { formatCurrency } from "@/lib/utils"
import { CreditCard } from "lucide-react"

const getPaymentStatusText = (status) => {
  const texts = {
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
    INITIATED: "Khởi tạo",
    PROCESSING: "Đang xử lý",
    REFUNDED: "Đã hoàn tiền"
  }
  return texts[status] || "Không xác định"
}

const getPaymentStatusStyle = (status) => {
  const styles = {
    SUCCESS: "bg-green-50 text-green-700 border-green-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    INITIATED: "bg-blue-50 text-blue-700 border-blue-200",
    PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
    REFUNDED: "bg-orange-50 text-orange-700 border-orange-200"
  }
  return styles[status] || "bg-gray-50 text-gray-700 border-gray-200"
}

const PaymentItem = memo(function PaymentItem({ payment, getPaymentStatusIcon, formatDate }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-medium text-sm">{payment.provider}</div>
          <div className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</div>
        </div>
      </div>
      <div className="text-right flex items-center gap-3">
        <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getPaymentStatusStyle(payment.status)}`}>
          {getPaymentStatusIcon(payment.status)}
          {getPaymentStatusText(payment.status)}
        </span>
        <span className="font-semibold text-sm">{formatCurrency(payment.amountCents)}</span>
      </div>
    </div>
  )
})

export const PaymentHistory = memo(function PaymentHistory({ orderDetails, getPaymentStatusIcon, formatDate }) {
  if (!orderDetails.payments?.length) return null

  return (
    <div className="bg-background rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-medium flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Lịch sử thanh toán
        </h3>
      </div>
      <div className="px-4">
        {orderDetails.payments.map((payment) => (
          <PaymentItem
            key={payment.id}
            payment={payment}
            getPaymentStatusIcon={getPaymentStatusIcon}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  )
})