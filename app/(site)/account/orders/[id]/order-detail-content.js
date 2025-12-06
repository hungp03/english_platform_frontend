"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getMyOrderById, cancelOrder, getOrderInvoice } from "@/lib/api/order"
import { OrderHeader } from "@/components/account/orders/order-detail/order-header"
import { OrderInfo } from "@/components/account/orders/order-detail/order-info"
import { OrderItems } from "@/components/account/orders/order-detail/order-items"
import { PaymentHistory } from "@/components/account/orders/order-detail/payment-history"
import { CustomerInfo } from "@/components/account/orders/order-detail/customer-info"
import { ActionButtons } from "@/components/account/orders/order-detail/action-buttons"
import { CancelOrderDialog } from "@/components/account/orders/order-detail/cancel-order-dialog"
import { ArrowLeft, CheckCircle, Clock, RefreshCw, XCircle, Loader2 } from "lucide-react"

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusConfig = (status) => {
  const configs = {
    PAID: { text: "Đã thanh toán", variant: "default", step: 3 },
    PENDING: { text: "Chờ thanh toán", variant: "secondary", step: 1 },
    CANCELLED: { text: "Đã hủy", variant: "destructive", step: -1 },
    REFUNDED: { text: "Đã hoàn tiền", variant: "outline", step: -1 }
  }
  return configs[status] || { text: "Không xác định", variant: "outline", step: 0 }
}

const getPaymentStatusIcon = (status) => {
  const icons = {
    SUCCESS: <CheckCircle className="w-4 h-4 text-green-500" />,
    FAILED: <XCircle className="w-4 h-4 text-red-500" />,
    INITIATED: <Clock className="w-4 h-4 text-primary" />,
    PROCESSING: <RefreshCw className="w-4 h-4 text-primary animate-spin" />,
    REFUNDED: <RefreshCw className="w-4 h-4 text-orange-500" />
  }
  return icons[status] || <Clock className="w-4 h-4 text-gray-500" />
}

const LoadingState = memo(function LoadingState() {
  return (
    <div className="min-h-screen bg-muted/30 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <span className="text-muted-foreground">Đang tải thông tin đơn hàng...</span>
          </div>
        </div>
      </div>
    </div>
  )
})

const ErrorState = memo(function ErrorState({ error }) {
  return (
    <div className="min-h-screen bg-muted/30 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/account/orders">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách đơn hàng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
})

const NotFoundState = memo(function NotFoundState() {
  return (
    <div className="min-h-screen bg-muted/30 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-muted-foreground mb-6">Đơn hàng bạn đang tìm không tồn tại hoặc bạn không có quyền xem.</p>
            <Link href="/account/orders">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách đơn hàng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
})

export default function OrderDetailContent({ orderId }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return
      setIsLoading(true)
      setError(null)
      try {
        const result = await getMyOrderById(orderId)
        if (result.success) {
          setOrderDetails(result.data)
        } else {
          setError(result.error || "Không thể tải thông tin đơn hàng")
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải thông tin đơn hàng")
        console.error("Error fetching order details:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrderDetails()
  }, [orderId])

  const handleViewInvoice = useCallback(async () => {
    try {
      const result = await getOrderInvoice(orderDetails.id)
      if (result.success && result.data?.fileUrl) {
        window.open(result.data.fileUrl, '_blank')
      } else {
        toast.error(result.error || "Không thể tải hóa đơn")
      }
    } catch (error) {
      console.error("Error fetching invoice:", error)
      toast.error("Có lỗi xảy ra khi tải hóa đơn")
    }
  }, [orderDetails?.id])

  const handleRequestRefund = useCallback(() => {
    const successfulPayment = orderDetails?.payments?.find(p => p.status === "SUCCESS")
    if (successfulPayment?.id) {
      router.push(`/account/refunds/new?paymentId=${successfulPayment.id}`)
    } else {
      toast.error("Không tìm thấy thông tin thanh toán hợp lệ để yêu cầu hoàn tiền.")
    }
  }, [orderDetails?.payments, router])

  const handlePayAgain = useCallback(() => {
    router.push(`/payment/order/${orderDetails.id}`)
  }, [orderDetails?.id, router])

  const handleCancelOrder = useCallback(() => {
    setShowCancelDialog(true)
  }, [])

  const handleConfirmCancel = useCallback(async (cancelReason) => {
    setIsProcessing(true)
    try {
      const result = await cancelOrder(orderDetails.id, cancelReason)
      if (result.success) {
        toast.success("Đơn hàng đã được hủy thành công!")
        setShowCancelDialog(false)
        const updatedOrder = await getMyOrderById(orderId)
        if (updatedOrder.success) {
          setOrderDetails(updatedOrder.data)
        } else {
          router.push('/account/orders')
        }
      } else {
        toast.error(result.error || "Không thể hủy đơn hàng. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("Error canceling order:", error)
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsProcessing(false)
    }
  }, [orderDetails?.id, orderId, router])

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} />
  if (!orderDetails) return <NotFoundState />

  const statusConfig = getStatusConfig(orderDetails.status)

  return (
    <div className="min-h-screen bg-muted/30 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {/* Back Button */}
          <Link href="/account/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Quay lại đơn hàng</span>
          </Link>

          {/* Order Header with Status */}
          <OrderHeader
            orderDetails={orderDetails}
            statusConfig={statusConfig}
          />

          {/* Customer & Order Info */}
          <div className="bg-background rounded-lg shadow-sm overflow-hidden">
            <CustomerInfo orderDetails={orderDetails} />
            <div className="border-t" />
            <OrderInfo orderDetails={orderDetails} formatDate={formatDate} />
          </div>

          {/* Order Items */}
          <OrderItems orderDetails={orderDetails} />

          {/* Payment History */}
          {orderDetails.totalCents > 0 && orderDetails.payments?.length > 0 && (
            <PaymentHistory
              orderDetails={orderDetails}
              getPaymentStatusIcon={getPaymentStatusIcon}
              formatDate={formatDate}
            />
          )}

          {/* Action Buttons */}
          <ActionButtons
            orderDetails={orderDetails}
            isProcessing={isProcessing}
            onViewInvoice={handleViewInvoice}
            onRequestRefund={handleRequestRefund}
            onPayAgain={handlePayAgain}
            onCancelOrder={handleCancelOrder}
          />

          {/* Cancel Dialog */}
          <CancelOrderDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            onConfirm={handleConfirmCancel}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  )
}