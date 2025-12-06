"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import ProfileForm from "./profile/profile-form";
import ChangePasswordForm from "./profile/change-password-form";

export default function ProfileCard() {
  const { hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return <div className="text-sm text-muted-foreground">Đang tải hồ sơ…</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Hồ sơ cá nhân */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Hồ sơ cá nhân
          </CardTitle>
          <CardDescription>Thông tin cá nhân</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      {/* Đổi mật khẩu */}
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Tăng bảo mật tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
