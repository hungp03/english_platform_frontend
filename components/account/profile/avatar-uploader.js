"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AvatarUploader({
  fileInputRef,
  avatarPreview,
  setAvatarPreview,
  avatarPending,
  setAvatarPending,
  recomputeHasChanges,
}) {
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Giới hạn dung lượng ảnh (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Kiểm tra định dạng hợp lệ
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Vui lòng chọn ảnh định dạng JPG hoặc PNG.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Tạo preview ảnh
    const url = URL.createObjectURL(file);
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });

    setAvatarPending(true);
    recomputeHasChanges({ avatarPending: true });
  };

  const handleAvatarCancel = () => {
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarPending(false);
    setAvatarPreview(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
    recomputeHasChanges({ avatarPending: false });
    toast.info("Đã hủy ảnh vừa chọn");
  };

  return (
    <div className="flex items-center gap-4">
      {/* Avatar Preview */}
      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs text-center px-2">
            No Avatar
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col justify-center gap-2 min-h-[88px] text-center">
        <Label
          htmlFor="avatar"
          className="cursor-pointer inline-flex justify-center items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 text-sm font-medium"
        >
          Upload Avatar
        </Label>

        <Input
          id="avatar"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {avatarPending && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-center"
            onClick={handleAvatarCancel}
          >
            Hủy ảnh vừa chọn
          </Button>
        )}

        <p className="text-[11px] text-muted-foreground mt-1">
          Ảnh dưới 2MB • Định dạng JPG, PNG
        </p>
      </div>
    </div>
  );
}
