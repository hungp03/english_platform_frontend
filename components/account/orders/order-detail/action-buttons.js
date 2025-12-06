import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Receipt, XCircle, CreditCard, Loader2 } from "lucide-react"

export const ActionButtons = memo(function ActionButtons({
  orderDetails,
  isProcessing,
  onViewInvoice,
  onCancelOrder,
  onPayAgain
}) {
  if (orderDetails.totalCents === 0) return null

  const isPending = orderDetails.status === "PENDING"
  const isPaid = orderDetails.status === "PAID"

  return (
    <div className="bg-background rounded-lg shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {isPending && (
          <>
            <Button
              className="flex-1 h-11"
              onClick={onPayAgain}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Thanh toán ngay
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-11 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={onCancelOrder}
              disabled={isProcessing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Hủy đơn hàng
            </Button>
          </>
        )}
        {isPaid && (
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={onViewInvoice}
          >
            <Receipt className="w-4 h-4 mr-2" />
            Xem hóa đơn
          </Button>
        )}
      </div>
    </div>
  )
})