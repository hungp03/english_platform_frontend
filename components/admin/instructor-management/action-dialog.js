import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const ActionDialog = ({
  open,
  onOpenChange,
  actionType,
  fullName,
  reviewNotes,
  onReviewNotesChange,
  rejectionReason,
  onRejectionReasonChange,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionType === "approve" ? "Phê duyệt yêu cầu" : "Từ chối yêu cầu"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {actionType === "approve"
              ? `Bạn có chắc chắn muốn phê duyệt yêu cầu trở thành giảng viên của ${fullName}?`
              : `Bạn có chắc chắn muốn từ chối yêu cầu trở thành giảng viên của ${fullName}?`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {actionType === "approve" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Ghi chú xét duyệt (không bắt buộc)</label>
              <Textarea
                placeholder="Nhập ghi chú về quyết định của bạn..."
                value={reviewNotes}
                onChange={(e) => onReviewNotesChange(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {actionType === "reject" && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Lý do từ chối</label>
                <Select value={rejectionReason} onValueChange={onRejectionReasonChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lý do từ chối" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUALIFICATION_INSUFFICIENT">Bằng cấp không đủ yêu cầu</SelectItem>
                    <SelectItem value="EXPERIENCE_INSUFFICIENT">Kinh nghiệm không đủ yêu cầu</SelectItem>
                    <SelectItem value="DOCUMENTATION_INCOMPLETE">Thiếu tài liệu</SelectItem>
                    <SelectItem value="DUPLICATE_REQUEST">Yêu cầu trùng lặp</SelectItem>
                    <SelectItem value="OTHER">Lý do khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {rejectionReason === "OTHER" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Ghi chú xét duyệt</label>
                  <Textarea
                    placeholder="Nhập ghi chú về quyết định của bạn..."
                    value={reviewNotes}
                    onChange={(e) => onReviewNotesChange(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {actionType === "approve" ? "Xác nhận duyệt" : "Xác nhận từ chối"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
