import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react"

export function OrdersStatistics({ stats, formatCurrency }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
                    <CardTitle className="text-xs sm:text-sm font-medium">Tổng đơn hàng</CardTitle>
                    <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.total}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
                    <CardTitle className="text-xs sm:text-sm font-medium">Chờ thanh toán</CardTitle>
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{stats.pending}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
                    <CardTitle className="text-xs sm:text-sm font-medium">Đã thanh toán</CardTitle>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.paid}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
                    <CardTitle className="text-xs sm:text-sm font-medium">Đã hủy</CardTitle>
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{stats.cancelled}</div>
                </CardContent>
            </Card>

            <Card className="col-span-2 sm:col-span-3 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
                    <CardTitle className="text-xs sm:text-sm font-medium">Tổng doanh thu</CardTitle>
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 truncate">{formatCurrency(stats.totalRevenue)}</div>
                </CardContent>
            </Card>
        </div>
    )
}
