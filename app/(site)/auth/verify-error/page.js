"use client";
import { useRouter } from "next/navigation";

export default function VerifyError() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Xác thực thất bại!</h1>
        <p className="text-gray-600 mb-6">Link xác thực không hợp lệ hoặc đã hết hạn.</p>
        <button 
          onClick={() => router.push("/register")}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Đăng ký lại
        </button>
      </div>
    </div>
  );
}
