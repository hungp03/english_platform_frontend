"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import ProfileForm from "./profile/profile-form";
import ChangePasswordForm from "./profile/change-password-form";
import LearningProfileForm from "./profile/learning-profile-form";

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

      {/* Hồ sơ học tập */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Hồ sơ học tập
          </CardTitle>
          <CardDescription>Cá nhân hóa lộ trình học của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <LearningProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
