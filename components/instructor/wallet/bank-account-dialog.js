import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInstructorBankAccount, updateInstructorBankAccount, deleteInstructorBankAccount } from "@/lib/api/instructor";
import { toast } from "sonner";
import { Mail, Calendar, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function BankAccountDialog({ open, onOpenChange }) {
  const [bankAccount, setBankAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBankAccount();
      setIsEditing(false);
    }
  }, [open]);

  const fetchBankAccount = async () => {
    setLoading(true);
    try {
      const result = await getInstructorBankAccount();
      if (result.success) {
        setBankAccount(result.data);
        setPaypalEmail(result.data?.paypalEmail || "");
      } else {
        toast.error(result.error || "Không thể tải thông tin tài khoản");
      }
    } catch (error) {
      console.error("Error fetching bank account:", error);
      toast.error("Đã xảy ra lỗi khi tải thông tin tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!paypalEmail.trim()) {
      toast.error("Vui lòng nhập email PayPal");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paypalEmail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setSaving(true);
    try {
      const result = await updateInstructorBankAccount(paypalEmail);
      if (result.success) {
        setBankAccount(result.data);
        setIsEditing(false);
        toast.success("Cập nhật thông tin tài khoản thành công");
      } else {
        toast.error(result.error || "Không thể cập nhật thông tin tài khoản");
      }
    } catch (error) {
      console.error("Error updating bank account:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật thông tin tài khoản");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteInstructorBankAccount();
      if (result.success) {
        toast.success("Xóa tài khoản thành công");
        setDeleteDialogOpen(false);
        await fetchBankAccount();
      } else {
        toast.error(result.error || "Không thể xóa tài khoản");
      }
    } catch (error) {
      console.error("Error deleting bank account:", error);
      toast.error("Đã xảy ra lỗi khi xóa tài khoản");
    } finally {
      setDeleting(false);
    }
  };

  const hasAccount = bankAccount?.id && bankAccount?.paypalEmail;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thông tin tài khoản nhận tiền</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </>
          ) : isEditing ? (
            <>
              <div className="flex items-center justify-center py-6">
                <Image
                  src="/paypal.png"
                  alt="PayPal"
                  width={64}
                  height={64}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypalEmail">Email PayPal</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  placeholder="your.email@paypal.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Hiện tại chỉ hỗ trợ thanh toán qua PayPal.
                  Vui lòng đảm bảo email PayPal của bạn đang hoạt động để nhận tiền.
                </p>
              </div>
            </>
          ) : hasAccount ? (
            <>
              <div className="flex items-center justify-center py-6">
                <Image
                  src="/paypal.png"
                  alt="PayPal"
                  width={64}
                  height={64}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email PayPal
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="font-medium">{bankAccount.paypalEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Ngày tạo
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border text-sm">
                      {format(new Date(bankAccount.createdAt), "dd/MM/yyyy")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Cập nhật
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border text-sm">
                      {format(new Date(bankAccount.updatedAt), "dd/MM/yyyy")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Hiện tại chỉ hỗ trợ thanh toán qua PayPal.
                  Vui lòng đảm bảo email PayPal của bạn đang hoạt động để nhận tiền.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center py-6">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-gray-400" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-foreground">Chưa có tài khoản nhận tiền</p>
                <p className="text-sm text-muted-foreground">
                  Vui lòng thêm email PayPal để nhận thanh toán
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Quan trọng:</strong> Bạn cần thiết lập tài khoản nhận tiền
                  để có thể rút tiền từ ví của mình.
                </p>
              </div>
            </>
          )}
        </div>

        {!loading && (
          <DialogFooter>
            {isEditing ? (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setPaypalEmail(bankAccount?.paypalEmail || "");
                  }}
                  disabled={saving}
                  className="flex-1 sm:flex-none"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 sm:flex-none"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                {hasAccount && (
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                )}
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {hasAccount ? "Chỉnh sửa" : "Thêm tài khoản"}
                </Button>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div>
                  Bạn có chắc chắn muốn xóa tài khoản PayPal này? Bạn sẽ không thể nhận thanh toán cho đến khi thêm tài khoản mới.
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-800 font-medium">
                    <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Bạn sẽ cần thêm lại thông tin tài khoản nếu muốn nhận tiền trong tương lai.
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? "Đang xóa..." : "Xóa tài khoản"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
    </>
  );
}
