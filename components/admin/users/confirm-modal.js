import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const LOCK_REASONS = [
  "Vi phạm điều khoản sử dụng",
  "Spam hoặc hành vi lạm dụng",
  "Nội dung không phù hợp",
  "Yêu cầu từ người dùng",
  "Khác"
];

const UNLOCK_REASONS = [
  "Đã xử lý vi phạm",
  "Yêu cầu từ người dùng",
  "Khôi phục sau xem xét",
  "Khác"
];

const ConfirmModal = ({ isOpen, onClose, onConfirm, willLock }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  if (!isOpen) return null;

  const actionText = willLock ? "khóa" : "mở khóa";
  const reasons = willLock ? LOCK_REASONS : UNLOCK_REASONS;
  
  const handleConfirm = () => {
    const finalReason = selectedReason === "Khác" ? customReason : selectedReason;
    if (!finalReason.trim()) {
      alert("Vui lòng chọn hoặc nhập lý do");
      return;
    }
    onConfirm(finalReason);
    setSelectedReason("");
    setCustomReason("");
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">
          Xác nhận {actionText} tài khoản
        </h3>
        <p className="text-sm mb-4">
          Bạn có chắc chắn muốn {actionText} tài khoản này?
        </p>
        
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Lý do</label>
          <Select value={selectedReason} onValueChange={setSelectedReason}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn lý do" />
            </SelectTrigger>
            <SelectContent>
              {reasons.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedReason === "Khác" && (
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Nhập lý do</label>
            <Textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Nhập lý do cụ thể..."
              rows={3}
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            onClick={handleClose}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            className={
              willLock
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-green-500 text-white hover:bg-green-600"
            }
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
