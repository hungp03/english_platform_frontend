"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThreadCreateForm from "@/components/forum/thread-create-form";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { FullPageLoader } from "@/components/ui/full-page-loader";

export default function ForumCreateThreadPage() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !user) {
      toast.error("Bạn cần đăng nhập để truy cập trang này");
      router.replace("/login"); 
    }
  }, [hasHydrated, user, router]);

  if (!hasHydrated || !user) {
    return <FullPageLoader />;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push("/forum")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>
      <ThreadCreateForm />
    </div>
  );
}