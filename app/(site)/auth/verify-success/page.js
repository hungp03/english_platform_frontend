"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VerifySuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/login"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Xác thực thành công!</h1>
        <p className="text-gray-600">Tài khoản của bạn đã được kích hoạt. Đang chuyển đến trang đăng nhập...</p>
      </div>
    </div>
  );
}
