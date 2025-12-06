import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal } from "lucide-react"
import { getStatusIcon, getStatusVariant, getStatusText } from "@/components/admin/orders/order-helpers"

export function OrderRow({ order, formatCurrency, formatDate }) {
    return (
        <TableRow className="hover:bg-gray-50">
            <TableCell>
                <div>
                    <div className="font-mono text-sm font-medium">{order.id}</div>
                    <div className="text-xs text-gray-500">Items: {order.itemCount || 0}</div>
                </div>
            </TableCell>
            <TableCell className="font-medium text-green-600">
                {formatCurrency(order.totalCents)}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <Badge variant={getStatusVariant(order.status)}>
                        {getStatusText(order.status)}
                    </Badge>
                </div>
            </TableCell>
            <TableCell className="text-sm text-gray-600">
                {formatDate(order.createdAt)}
            </TableCell>
            <TableCell className="text-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}
