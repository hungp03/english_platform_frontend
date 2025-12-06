import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, XCircle, Package } from "lucide-react"
import { OrderRow } from "./order-row"
import { OrderCard } from "./order-card"

export function OrdersTable({
    orders,
    loading,
    error,
    pagination,
    currentPage,
    setCurrentPage,
    loadOrders,
    formatCurrency,
    formatDate
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-base sm:text-lg">Danh sách đơn hàng</span>
                    <span className="text-xs sm:text-sm font-normal text-gray-600">
                        {loading ? "Đang tải..." : `Hiển thị ${orders.length} / ${pagination.total} đơn hàng`}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Đang tải danh sách đơn hàng...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <XCircle className="mx-auto h-8 w-8 text-red-400" />
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={loadOrders}
                        >
                            Thử lại
                        </Button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy đơn hàng</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã đơn hàng</TableHead>
                                        <TableHead>Số tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead className="text-center">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <OrderRow
                                            key={order.id}
                                            order={order}
                                            formatCurrency={formatCurrency}
                                            formatDate={formatDate}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3">
                            {orders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {!loading && !error && pagination.pages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-4 mt-4 border-t">
                        <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                            Trang {pagination.page} / {pagination.pages} (Tổng: {pagination.total} đơn hàng)
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage <= 1}
                                className="text-xs sm:text-sm"
                            >
                                Trước
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                                disabled={currentPage >= pagination.pages}
                                className="text-xs sm:text-sm"
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
