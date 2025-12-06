import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, CheckCircle, XCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export function PaymentInfo({ payments }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                    Thông tin thanh toán
                </CardTitle>
            </CardHeader>
            <CardContent>
                {payments?.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                        {payments.map((payment) => (
                            <div key={payment.id} className="border rounded-lg p-3 sm:p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Nhà cung cấp</p>
                                        <p className="font-medium text-sm sm:text-base">{payment.provider}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Số tiền</p>
                                        <p className="font-medium text-green-600 text-sm sm:text-base">
                                            {formatCurrency(payment.amountCents)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Trạng thái</p>
                                        <div className="flex items-center gap-2">
                                            {payment.status === "SUCCESS" ? (
                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                            ) : (
                                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                                            )}
                                            <span className="text-xs sm:text-sm font-medium">
                                                {payment.status === "SUCCESS" ? "Thành công" : payment.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Thời gian</p>
                                        <p className="font-medium text-sm sm:text-base">{formatDate(payment.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm sm:text-base">Chưa có thanh toán nào</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
