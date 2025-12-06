"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import AvatarUploader from "./avatar-uploader";

export default function ProfileForm() {
  const { user } = useAuthStore();
  const updateUser = useAuthStore((s) => s.updateUser);
  const fileInputRef = useRef(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarPending, setAvatarPending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Đồng bộ dữ liệu khi user thay đổi
  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setEmail(user.email || "");
    setAvatarPreview(user.avatarUrl || null);
    setAvatarPending(false);
    setHasChanges(false);
  }, [user]);

  // Kiểm tra xem có thay đổi gì không
  const recomputeHasChanges = (next = {}) => {
    const nextFullName = next.fullName ?? fullName;
    const nextEmail = next.email ?? email;
    const nextPending = next.avatarPending ?? avatarPending;
    setHasChanges(
      nextFullName !== user?.fullName ||
      nextEmail !== user?.email ||
      nextPending
    );
  };

  // Gọi hàm update từ store
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const avatarFile = fileInputRef.current?.files?.[0] || null;

      const result = await updateUser({ fullName, email, avatarFile });

      if (result?.success) {
        setAvatarPending(false);
        setHasChanges(false);
        toast.success("Hồ sơ được cập nhật thành công");
      } else {
        toast.error(result?.error || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Update user error:", err);
      toast.error("Lỗi khi cập nhật hồ sơ");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      <AvatarUploader
        fileInputRef={fileInputRef}
        avatarPreview={avatarPreview}
        setAvatarPreview={setAvatarPreview}
        avatarPending={avatarPending}
        setAvatarPending={setAvatarPending}
        recomputeHasChanges={recomputeHasChanges}
      />

      <div>
        <Label className="mb-2" htmlFor="fullName">
          Tên
        </Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => {
            const v = e.target.value;
            setFullName(v);
            recomputeHasChanges({ fullName: v });
          }}
        />
      </div>

      <div>
        <Label className="mb-2" htmlFor="email">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          disabled
          value={email}
          onChange={(e) => {
            const v = e.target.value;
            setEmail(v);
            recomputeHasChanges({ email: v });
          }}
        />
      </div>

      {hasChanges && (
        <Button
          type="submit"
          className="w-full bg-blue-600 text-white hover:bg-blue-500"
          disabled={updating}
        >
          {updating ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
        </Button>
      )}
    </form>
  );
}
