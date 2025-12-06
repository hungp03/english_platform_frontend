"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CourseInfo } from "@/components/payment/course-info"
import { PaymentSummary } from "@/components/payment/payment-summary"
import { PaymentMethods } from "@/components/payment/payment-methods"
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getCartCheckout } from "@/lib/api/cart"
import { createOrder } from "@/lib/api/order"
import { createPayPalCheckout, createPayOSCheckout } from "@/lib/api/payment"

export default function CheckoutPage() {
  const [selectedPayment, setSelectedPayment] = useState("payOS")
  const [cartData, setCartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const fetchCartData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getCartCheckout()

      if (result.success) {
        setCartData(result.data)
      } else {
        setError(result.error)
        toast.error(result.error || "Không thể tải thông tin giỏ hàng. Vui lòng thử lại.")
      }
    } catch (err) {
      setError(err.message)
      toast.error("Không thể tải thông tin giỏ hàng. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCartData()
  }, [fetchCartData])

  // Calculate total from cart data
  const totalAmount = useMemo(() => 
    cartData.reduce((sum, course) => sum + course.priceCents, 0),
    [cartData]
  )

  const handlePayment = useCallback(async () => {
    if (cartData.length === 0 || isProcessing) return

    setIsProcessing(true)

    try {
      // Step 1: Create order with items array format for all cart courses
      const orderRequest = {
        orderSource: "CART",
        items: cartData.map((course) => ({
          entityType: "COURSE",
          entityId: course.id,
          quantity: 1,
          unitPriceCents: course.priceCents
        }))
      }

      const orderResult = await createOrder(orderRequest)

      if (!orderResult.success) {
        toast.error(orderResult.error || "Không thể tạo đơn hàng")
        return
      }

      const order = orderResult.data

      // Step 2: Create payment checkout based on selected method
      let paymentResult
      if (selectedPayment === "paypal") {
        paymentResult = await createPayPalCheckout(order.id)

        if (!paymentResult.success) {
          toast.error(paymentResult.error || "Không thể tạo thanh toán PayPal")
          return
        }

        const paymentData = paymentResult.data

        // Step 3: Open PayPal approval URL directly on this page
        if (paymentData.approvalUrl) {
          window.location.href = paymentData.approvalUrl
        } else {
          toast.error("Không nhận được link thanh toán từ PayPal")
        }
      } else if (selectedPayment === "payOS") {
        paymentResult = await createPayOSCheckout(order.id)

        if (!paymentResult.success) {
          toast.error(paymentResult.error || "Không thể tạo thanh toán PayOS")
          return
        }

        const paymentData = paymentResult.data

        // Step 3: Open PayOS checkout URL directly on this page
        if (paymentData.checkoutUrl) {
          window.location.href = paymentData.checkoutUrl
        } else {
          toast.error("Không nhận được link thanh toán từ PayOS")
        }
      } else {
        toast.error("Phương thức thanh toán không được hỗ trợ")
      }

    } catch (err) {
      console.error("Payment process error:", err)
      toast.error("Đã xảy ra lỗi trong quá trình thanh toán")
    } finally {
      setIsProcessing(false)
    }
  }, [cartData, isProcessing, selectedPayment, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium">Đang tải thông tin giỏ hàng...</p>
        </div>
      </div>
    )
  }

  if (error || cartData.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold">
            {error || "Giỏ hàng trống"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {error || "Không có khóa học nào trong giỏ hàng của bạn"}
          </p>
          <Button onClick={() => router.push("/courses")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Thanh toán giỏ hàng</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Course Info */}
          <div className="lg:col-span-2 space-y-6">
            {cartData.map((course) => (
              <CourseInfo key={course.id} course={course} />
            ))}
            <PaymentMethods
              selected={selectedPayment}
              onSelect={setSelectedPayment}
            />
          </div>

          {/* Right Column - Payment Summary */}
          <div className="space-y-6">
            <PaymentSummary
              price={totalAmount}
              total={totalAmount}
            />

            <Button
              size="lg"
              className="w-full"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Tiến hành thanh toán"
              )}
            </Button>

            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Bằng việc thanh toán, bạn đồng ý với</p>
              <p className="text-primary cursor-pointer hover:underline">
                Điều khoản sử dụng & Chính sách bảo mật
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
