import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Save, RefreshCw } from "lucide-react"
import { getStatusIcon, getStatusVariant, getStatusText } from "@/components/admin/orders/order-helpers"

export function StatusUpdateDialog({
    orderDetails,
    showStatusDialog,
    setShowStatusDialog,
    newStatus,
    setNewStatus,
    statusUpdateReason,
    setStatusUpdateReason,
    isUpdatingStatus,
    handleStatusUpdate,
    isStatusUpdateAllowed
}) {
    return (
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Cập nhật trạng thái</span>
                    <span className="sm:hidden">Cập nhật</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">Cập nhật trạng thái đơn hàng</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        Thay đổi trạng thái của đơn hàng
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <label className="text-xs sm:text-sm font-medium">Trạng thái hiện tại</label>
                        <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(orderDetails.status)}
                            <Badge variant={getStatusVariant(orderDetails.status)} className="text-xs">
                                {getStatusText(orderDetails.status)}
                            </Badge>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs sm:text-sm font-medium">Trạng thái mới</label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger className="mt-1 text-xs sm:text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                {/* <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem> */}
                            </SelectContent>
                        </Select>
                        {!isStatusUpdateAllowed(orderDetails.status, newStatus) && newStatus !== orderDetails.status && (
                            <p className="text-xs sm:text-sm text-red-600 mt-1">
                                Không thể chuyển từ {getStatusText(orderDetails.status)} sang {getStatusText(newStatus)}
                            </p>
                        )}
                    </div>

                    {newStatus === "CANCELLED" && (
                        <div>
                            <label className="text-xs sm:text-sm font-medium">
                                Lý do hủy đơn <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full mt-1 p-2 border rounded-md text-xs sm:text-sm"
                                rows={3}
                                placeholder="Nhập lý do hủy đơn hàng (15-200 ký tự)..."
                                value={statusUpdateReason}
                                onChange={(e) => setStatusUpdateReason(e.target.value)}
                                maxLength={200}
                            />
                            <div className="flex justify-between items-center text-xs mt-1">
                                <p className={statusUpdateReason.length < 15 ? "text-red-500" : "text-gray-500"}>
                                    {statusUpdateReason.length < 15 ? `Cần thêm ${15 - statusUpdateReason.length} ký tự` : "Đủ ký tự"}
                                </p>
                                <p className="text-gray-500">
                                    {statusUpdateReason.length}/200 ký tự
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowStatusDialog(false)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleStatusUpdate}
                            disabled={
                                isUpdatingStatus ||
                                !isStatusUpdateAllowed(orderDetails.status, newStatus) ||
                                (newStatus === "CANCELLED" && (statusUpdateReason.length < 15 || statusUpdateReason.length > 200))
                            }
                            className="w-full sm:w-auto text-xs sm:text-sm"
                        >
                            {isUpdatingStatus ? (
                                <>
                                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    Cập nhật
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
