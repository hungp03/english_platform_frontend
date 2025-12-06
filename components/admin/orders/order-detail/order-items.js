import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function OrderItems({ items, totalCents }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                    Sản phẩm trong đơn hàng
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sản phẩm</TableHead>
                                <TableHead className="text-center">Số lượng</TableHead>
                                <TableHead className="text-right">Đơn giá</TableHead>
                                <TableHead className="text-right">Thành tiền</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.title}</div>
                                    </TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(item.unitPriceCents)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(item.totalPriceCents)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {items?.map((item) => (
                        <div key={item.id} className="border rounded-lg p-3 space-y-2">
                            <div className="font-medium text-sm">{item.title}</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-600">Số lượng:</span>
                                    <span className="ml-1 font-medium">{item.quantity}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-600">Đơn giá:</span>
                                    <span className="ml-1 font-medium">{formatCurrency(item.unitPriceCents)}</span>
                                </div>
                            </div>
                            <div className="text-right pt-1 border-t">
                                <span className="text-xs text-gray-600">Thành tiền: </span>
                                <span className="font-semibold text-green-600">
                                    {formatCurrency(item.totalPriceCents)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <Separator className="my-3 sm:my-4" />

                <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-semibold">Tổng cộng:</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-600">
                        {formatCurrency(totalCents)}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
