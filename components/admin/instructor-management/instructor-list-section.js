import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreVertical, UserMinus, UserCheck } from "lucide-react";
import { removeInstructorRole, restoreInstructorRole } from "@/lib/api/instructor";
import { toast } from "sonner";

const InstructorListSection = ({ instructors, loading, currentPage, totalPages, onPageChange }) => {
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [restoreReason, setRestoreReason] = useState("");
  const [customRestoreReason, setCustomRestoreReason] = useState("");

  const predefinedReasons = [
    "Vi phạm chính sách nền tảng",
    "Chất lượng giảng dạy không đạt yêu cầu",
    "Nhiều khiếu nại từ học viên",
    "Không hoạt động trong thời gian dài",
    "Khác"
  ];

  const restoreReasons = [
    "Đã khắc phục vi phạm",
    "Cải thiện chất lượng giảng dạy",
    "Yêu cầu từ học viên",
    "Quyết định của ban quản trị",
    "Khác"
  ];

  const handleRevokeClick = (instructor) => {
    setSelectedInstructor(instructor);
    setSelectedReason("");
    setCustomReason("");
    setRevokeDialogOpen(true);
  };

  const handleRestoreClick = (instructor) => {
    setSelectedInstructor(instructor);
    setRestoreReason("");
    setCustomRestoreReason("");
    setRestoreDialogOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedInstructor) return;

    const reason = restoreReason === "Khác" ? customRestoreReason : restoreReason;

    if (!reason || reason.trim() === "") {
      toast.error("Vui lòng chọn hoặc nhập lý do khôi phục");
      return;
    }

    setIsRestoring(true);
    try {
      const result = await restoreInstructorRole(selectedInstructor.userId, reason);
      if (result.success) {
        toast.success("Khôi phục quyền giảng viên thành công");
        setRestoreDialogOpen(false);
        if (onPageChange) {
          onPageChange(currentPage);
        }
      } else {
        toast.error(result.error || "Khôi phục quyền giảng viên thất bại");
      }
    } catch (error) {
      console.error("Error restoring instructor role:", error);
      toast.error("Có lỗi xảy ra khi khôi phục quyền giảng viên");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!selectedInstructor) return;

    const reason = selectedReason === "Khác" ? customReason : selectedReason;

    if (!reason || reason.trim() === "") {
      toast.error("Vui lòng chọn hoặc nhập lý do thu hồi");
      return;
    }

    setIsRevoking(true);
    try {
      const result = await removeInstructorRole(selectedInstructor.userId, reason);
      if (result.success) {
        toast.success("Thu hồi quyền giảng viên thành công");
        setRevokeDialogOpen(false);
        // Refresh the list
        if (onPageChange) {
          onPageChange(currentPage);
        }
      } else {
        toast.error(result.error || "Thu hồi quyền giảng viên thất bại");
      }
    } catch (error) {
      console.error("Error revoking instructor role:", error);
      toast.error("Có lỗi xảy ra khi thu hồi quyền giảng viên");
    } finally {
      setIsRevoking(false);
    }
  };
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 grid grid-cols-4 gap-4">
              <Skeleton className="h-4 w-full col-span-1" />
              <Skeleton className="h-4 w-full col-span-1" />
              <Skeleton className="h-4 w-full col-span-1" />
              <Skeleton className="h-4 w-full col-span-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!instructors || instructors.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Không có giảng viên nào
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giảng viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kinh nghiệm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tham gia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {instructors.map((instructor) => (
              <tr key={instructor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={instructor.avatarUrl} alt={instructor.fullName} />
                      <AvatarFallback>{instructor.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-gray-900">{instructor.fullName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {instructor.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {instructor.experienceYears} năm
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {instructor.isActive ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Hoạt động
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Đã thu hồi
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(instructor.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {instructor.isActive ? (
                        <DropdownMenuItem
                          onClick={() => handleRevokeClick(instructor)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Thu hồi quyền
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleRestoreClick(instructor)}
                          className="text-green-600 focus:text-green-600"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Khôi phục quyền
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
            siblingCount={1}
          />
        </div>
      )}

      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thu hồi quyền giảng viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn thu hồi quyền giảng viên của <strong>{selectedInstructor?.fullName}</strong> không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do thu hồi</Label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedReason === "Khác" && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Lý do cụ thể</Label>
                <Textarea
                  id="customReason"
                  placeholder="Nhập lý do thu hồi..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRevoking ? "Đang xử lý..." : "Thu hồi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận khôi phục quyền giảng viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khôi phục quyền giảng viên cho <strong>{selectedInstructor?.fullName}</strong> không?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="restoreReason">Lý do khôi phục</Label>
              <Select value={restoreReason} onValueChange={setRestoreReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do" />
                </SelectTrigger>
                <SelectContent>
                  {restoreReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {restoreReason === "Khác" && (
              <div className="space-y-2">
                <Label htmlFor="customRestoreReason">Lý do cụ thể</Label>
                <Textarea
                  id="customRestoreReason"
                  placeholder="Nhập lý do khôi phục..."
                  value={customRestoreReason}
                  onChange={(e) => setCustomRestoreReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestore}
              disabled={isRestoring}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRestoring ? "Đang xử lý..." : "Khôi phục"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InstructorListSection;
