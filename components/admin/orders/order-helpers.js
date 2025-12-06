import { Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function getStatusVariant(status) {
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

export function getStatusIcon(status) {
    switch (status) {
        case "PAID":
            return <CheckCircle className="w-4 h-4 text-green-600" />
        case "PENDING":
            return <Clock className="w-4 h-4 text-yellow-600" />
        case "CANCELLED":
            return <XCircle className="w-4 h-4 text-red-600" />
        case "REFUNDED":
            return <RefreshCw className="w-4 h-4 text-blue-600" />
        default:
            return <Clock className="w-4 h-4 text-gray-600" />
    }
}

export function getStatusText(status) {
    switch (status) {
        case "PAID":
            return "Đã thanh toán"
        case "PENDING":
            return "Chờ thanh toán"
        case "CANCELLED":
            return "Đã hủy"
        // case "REFUNDED":
        //     return "Đã hoàn tiền"
        default:
            return "Không xác định"
    }
}

export function calculateStats(orders, pagination) {
    return {
        total: pagination.total || 0,
        pending: orders.filter(o => o.status === "PENDING").length,
        paid: orders.filter(o => o.status === "PAID").length,
        cancelled: orders.filter(o => o.status === "CANCELLED").length,
        refunded: orders.filter(o => o.status === "REFUNDED").length,
        totalRevenue: orders.filter(o => o.status === "PAID").reduce((sum, o) => sum + (o.totalCents || 0), 0)
    }
}
