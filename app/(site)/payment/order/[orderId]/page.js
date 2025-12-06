"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentMethods } from "@/components/payment/payment-methods"
import { ArrowLeft, Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { getMyOrderById } from "@/lib/api/order"
import { createPayPalCheckout, createPayOSCheckout } from "@/lib/api/payment"
import { formatCurrency } from "@/lib/utils"

export default function OrderPaymentPage() {
    const [selectedPayment, setSelectedPayment] = useState("payOS")
    const [orderData, setOrderData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const router = useRouter()
    const params = useParams()
    const orderId = params.orderId

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                setLoading(true)
                const result = await getMyOrderById(orderId)

                if (result.success) {
                    if (result.data.status !== "PENDING") {
                        toast.error("Đơn hàng này không thể thanh toán")
                        router.push(`/account/orders/${orderId}`)
                        return
                    }
                    setOrderData(result.data)
                } else {
                    setError(result.error)
                    toast.error(result.error || "Không thể tải thông tin đơn hàng")
                }
            } catch (err) {
                setError(err.message)
                toast.error("Không thể tải thông tin đơn hàng")
            } finally {
                setLoading(false)
            }
        }

        if (orderId) {
            fetchOrderData()
        }
    }, [orderId, router])

    const handlePayment = async () => {
        if (!orderData || isProcessing) return

        setIsProcessing(true)

        try {
            let paymentResult
            if (selectedPayment === "paypal") {
                paymentResult = await createPayPalCheckout(orderData.id)

                if (!paymentResult.success) {
                    toast.error(paymentResult.error || "Không thể tạo thanh toán PayPal")
                    return
                }

                const paymentData = paymentResult.data

                if (paymentData.approvalUrl) {
                    window.location.href = paymentData.approvalUrl
                } else {
                    toast.error("Không nhận được link thanh toán từ PayPal")
                }
            } else if (selectedPayment === "payOS") {
                paymentResult = await createPayOSCheckout(orderData.id)

                if (!paymentResult.success) {
                    toast.error(paymentResult.error || "Không thể tạo thanh toán PayOS")
                    return
                }

                const paymentData = paymentResult.data

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
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="text-lg font-medium">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        )
    }

    if (error || !orderData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold">
                        {error || "Không tìm thấy đơn hàng"}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {error || "Đơn hàng không tồn tại hoặc không thể thanh toán"}
                    </p>
                    <Button onClick={() => router.push("/account/orders")} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại đơn hàng
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" className="mb-4" onClick={() => router.push(`/account/orders/${orderId}`)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">Thanh toán đơn hàng</h1>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Order Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Mã đơn hàng:</span>
                                <span className="font-mono font-medium">{orderData.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Số lượng sản phẩm:</span>
                                <span className="font-medium">{orderData.items?.length || 0} sản phẩm</span>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Tổng tiền:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatCurrency(orderData.totalCents)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <PaymentMethods
                        selected={selectedPayment}
                        onSelect={setSelectedPayment}
                    />

                    {/* Payment Button */}
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
                            <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Tiến hành thanh toán
                            </>
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
    )
}
