import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "403 - Forbidden",
  description: "Bạn không có quyền truy cập trang này",
};

const Forbidden = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100">
          <ShieldAlert className="w-12 h-12 text-amber-500" />
        </div>
        <h1 className="text-6xl font-bold text-amber-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Bạn không có quyền truy cập
        </h2>
        <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto">
          Xin lỗi, bạn không có quyền truy cập trang này.
          Vui lòng liên hệ hỗ trợ nếu bạn nghĩ đây là lỗi.
        </p>
        <Link href="/" passHref>
          <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
            Quay về trang chủ
          </Button>
        </Link>
      </div>
    </main>
  );
};

export default Forbidden;
