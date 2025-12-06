import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { getStatusIcon, getStatusVariant, getStatusText } from "@/components/admin/orders/order-helpers"

export function OrderCard({ order, formatCurrency, formatDate }) {
    return (
        <div className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-medium truncate">{order.id}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Items: {order.itemCount || 0}</div>
                </div>
                <Badge variant={getStatusVariant(order.status)} className="text-xs shrink-0">
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{getStatusText(order.status)}</span>
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <div className="text-xs text-gray-600">Số tiền</div>
                    <div className="font-semibold text-green-600">{formatCurrency(order.totalCents)}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-600">Ngày tạo</div>
                    <div className="font-medium text-gray-900">{formatDate(order.createdAt)}</div>
                </div>
            </div>

            <div className="pt-2 border-t">
                <Link href={`/admin/orders/${order.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Xem chi tiết
                    </Button>
                </Link>
            </div>
        </div>
    )
}
