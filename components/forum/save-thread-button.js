"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaveThread } from "@/lib/api/forum";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

export default function SaveThreadButton({ threadId, initialIsSaved }) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const handleToggleSave = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu bài viết");
      router.push("/login");
      return;
    }

    const previousState = isSaved;
    // Optimistic update
    setIsSaved(!isSaved);
    setLoading(true);

    try {
      const res = await toggleSaveThread(threadId);
      
      if (res.success) {
        toast.success(previousState ? "Đã bỏ lưu bài viết" : "Đã lưu bài viết");
      } else {
        // Revert on failure
        setIsSaved(previousState);
        toast.error(res.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      setIsSaved(previousState);
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleSave}
      disabled={loading}
      className={`gap-2 ${isSaved ? "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100" : ""}`}
      title={isSaved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
    >
      <Bookmark 
        size={16} 
        className={isSaved ? "fill-blue-600" : "fill-transparent"} 
      />
      {isSaved ? "Đã lưu" : "Lưu bài viết"}
    </Button>
  );
}