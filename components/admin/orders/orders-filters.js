import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Filter, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export function OrdersFilters({ statusFilter, setStatusFilter, dateFilter, setDateFilter, clearFilters }) {
    return (
        <Card className="mb-2">
            <CardHeader className="p-2 sm:p-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="w-4 h-4" />
                            Bộ lọc
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            Tìm kiếm và lọc đơn hàng theo các tiêu chí
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="hidden sm:flex text-xs"
                    >
                        Xóa bộ lọc
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Date Range Filter */}
                    <div>
                        <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Khoảng thời gian</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal text-xs sm:text-sm",
                                        !dateFilter.from && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                    {dateFilter.from ? (
                                        dateFilter.to ? (
                                            <>
                                                {format(dateFilter.from, "dd/MM/yyyy")} -{" "}
                                                {format(dateFilter.to, "dd/MM/yyyy")}
                                            </>
                                        ) : (
                                            format(dateFilter.from, "dd/MM/yyyy")
                                        )
                                    ) : (
                                        "Chọn khoảng thời gian"
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0 [&_.rdp-head_row]:hidden [&_.rdp-weekday]:hidden"
                                align="start"
                            >
                                <Calendar
                                    mode="range"
                                    selected={{
                                        from: dateFilter.from,
                                        to: dateFilter.to,
                                    }}
                                    onSelect={(range) => {
                                        setDateFilter({
                                            from: range?.from || null,
                                            to: range?.to || null,
                                        })
                                    }}
                                    numberOfMonths={2}
                                    className="text-sm"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Trạng thái</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="text-xs sm:text-sm">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                {/* <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem> */}
                                <SelectItem value="FAILED">Thất bại</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Mobile Clear Filter Button */}
                <div className="mt-2 sm:hidden">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="w-full text-xs"
                    >
                        Xóa bộ lọc
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
