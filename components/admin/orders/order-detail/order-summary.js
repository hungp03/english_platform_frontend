import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getStatusIcon, getStatusVariant, getStatusText } from "@/components/admin/orders/order-helpers"

export function OrderSummary({ orderDetails }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    Tóm tắt đơn hàng
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
                <div>
                    <p className="text-xs sm:text-sm text-gray-600">Mã đơn hàng</p>
                    <p className="font-mono text-xs sm:text-sm break-all">{orderDetails.id}</p>
                </div>
                <div>
                    <p className="text-xs sm:text-sm text-gray-600">Trạng thái</p>
                    <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(orderDetails.status)}
                        <Badge variant={getStatusVariant(orderDetails.status)} className="text-xs">
                            {getStatusText(orderDetails.status)}
                        </Badge>
                    </div>
                </div>
                <div>
                    <p className="text-xs sm:text-sm text-gray-600">Tiền tệ</p>
                    <p className="font-medium text-sm sm:text-base">{orderDetails.currency}</p>
                </div>
                <div>
                    <p className="text-xs sm:text-sm text-gray-600">Ngày tạo</p>
                    <p className="font-medium text-sm sm:text-base">{formatDate(orderDetails.createdAt)}</p>
                </div>
                {orderDetails.paidAt && (
                    <div>
                        <p className="text-xs sm:text-sm text-gray-600">Ngày thanh toán</p>
                        <p className="font-medium text-sm sm:text-base">{formatDate(orderDetails.paidAt)}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
