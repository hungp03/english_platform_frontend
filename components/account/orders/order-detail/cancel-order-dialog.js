import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { XCircle, Loader2 } from "lucide-react"

const CANCEL_REASONS = [
    { value: "changed_mind", label: "Tôi đã thay đổi ý định" },
    { value: "ordered_by_mistake", label: "Đặt hàng nhầm" },
    { value: "payment_issues", label: "Gặp vấn đề với thanh toán" },
    { value: "other", label: "Lý do khác" }
]

export function CancelOrderDialog({ open, onOpenChange, onConfirm, isProcessing }) {
    const [selectedReason, setSelectedReason] = useState("")
    const [customReason, setCustomReason] = useState("")

    const handleConfirm = () => {
        let reason = ""

        if (selectedReason === "other") {
            reason = customReason.trim()
        } else {
            const reasonObj = CANCEL_REASONS.find(r => r.value === selectedReason)
            reason = reasonObj ? reasonObj.label : ""
        }

        if (!reason) {
            return
        }

        onConfirm(reason)
    }

    const handleClose = () => {
        if (!isProcessing) {
            setSelectedReason("")
            setCustomReason("")
            onOpenChange(false)
        }
    }

    const isValid = selectedReason && (selectedReason !== "other" || (customReason.trim().length >= 15 && customReason.trim().length <= 200))

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        Hủy đơn hàng
                    </DialogTitle>
                    <DialogDescription>
                        Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Lý do hủy đơn</Label>
                        <Select value={selectedReason} onValueChange={setSelectedReason} disabled={isProcessing}>
                            <SelectTrigger id="reason">
                                <SelectValue placeholder="Chọn lý do" />
                            </SelectTrigger>
                            <SelectContent>
                                {CANCEL_REASONS.map((reason) => (
                                    <SelectItem key={reason.value} value={reason.value}>
                                        {reason.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedReason === "other" && (
                        <div className="space-y-2">
                            <Label htmlFor="custom-reason">Chi tiết lý do</Label>
                            <Textarea
                                id="custom-reason"
                                placeholder="Nhập lý do của bạn (15-200 ký tự)"
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                maxLength={200}
                                rows={4}
                                disabled={isProcessing}
                            />
                            <div className="flex justify-between items-center text-xs">
                                <p className={customReason.length < 15 ? "text-red-500" : "text-gray-500"}>
                                    {customReason.length < 15 ? `Cần thêm ${15 - customReason.length} ký tự` : "Đủ ký tự"}
                                </p>
                                <p className="text-gray-500">
                                    {customReason.length}/200 ký tự
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="w-full sm:w-auto"
                    >
                        Quay lại
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!isValid || isProcessing}
                        className="w-full sm:w-auto"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Xác nhận hủy
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
