"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { changePassword } from "@/lib/api/user";
import { useAuthStore } from "@/store/auth-store";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function ChangePasswordForm() {
    const router = useRouter();
    const logoutAllUser = useAuthStore((s) => s.logoutAllUser);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();

        // VALIDATION

        const passwordRegex = /^[^\s]+$/; // Không chứa khoảng trắng

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Vui lòng nhập đầy đủ các trường mật khẩu");
            return;
        }

        if (currentPassword.length < 8 || newPassword.length < 8) {
            toast.error("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
            toast.error("Mật khẩu không được chứa khoảng trắng");
            return;
        }

        if (newPassword === currentPassword) {
            toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        setLoading(true);
        const res = await changePassword(currentPassword, newPassword, confirmPassword);
        setLoading(false);

        if (res?.success) {
            toast.success("Đổi mật khẩu thành công");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowLogoutDialog(true);
        } else {
            toast.error(res?.error || "Đổi mật khẩu thất bại");
        }
    };


    const handleLogoutAll = async () => {
        setShowLogoutDialog(false);
        const res = await logoutAllUser();

        if (res?.success) {
            toast.success("Đã đăng xuất khỏi tất cả thiết bị");
            router.push("/");
        } else {
            toast.error("Đăng xuất tất cả thất bại");
        }
    };

    return (
        <>
            {/* === Form đổi mật khẩu === */}
            <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                    <Label className="mb-1">Mật khẩu hiện tại</Label>
                    <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Label className="mb-1">Mật khẩu mới</Label>
                    <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Label className="mb-1">Xác nhận mật khẩu</Label>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full bg-blue-600 text-white hover:bg-blue-500"
                    disabled={loading}
                >
                    {loading ? "Đang đổi..." : "Xác nhận đổi mật khẩu"}
                </Button>
            </form>

            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Đổi mật khẩu thành công 🎉</DialogTitle>
                        <DialogDescription>
                            Bạn có muốn đăng xuất khỏi tất cả các thiết bị khác để đảm bảo an toàn không? Sẽ mất một chút thời gian để đăng xuất tất cả.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                            Giữ đăng nhập
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-500" onClick={handleLogoutAll}>
                            Đăng xuất tất cả
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
