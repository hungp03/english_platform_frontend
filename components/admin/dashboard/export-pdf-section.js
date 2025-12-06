"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react"; // Đổi icon cho hợp với PDF
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportDashboardData } from "@/lib/api/admin-overview";
import { toast } from "sonner";
import { Card } from "@/components/ui/card"; // Thêm Card để bọc cho đẹp (tùy chọn)

const EXPORT_TYPES = [
//   { value: "summary", label: "Tổng quan Dashboard (PDF)" },
  { value: "user-growth", label: "Tăng trưởng người dùng (PDF)" },
  { value: "revenue", label: "Báo cáo doanh thu (PDF)" },
  { value: "enrollments", label: "Báo cáo Enrollment (PDF)" },
  { value: "top-courses", label: "Top 50 khóa học (PDF)" },
  { value: "top-instructors", label: "Top 50 giảng viên (PDF)" },
  { value: "top-revenue-courses", label: "Top doanh thu khóa học (PDF)" },
];

export default function ExportSection() {
//   const [selectedType, setSelectedType] = useState("summary");
  const [selectedType, setSelectedType] = useState("user-growth");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!selectedType) {
      toast.error("Vui lòng chọn loại báo cáo");
      return;
    }

    setLoading(true);
    try {
      // 1. Gọi API (Lúc này trả về Blob PDF)
      const blob = await exportDashboardData(selectedType);
      
      // 2. Tạo URL ảo
      const url = window.URL.createObjectURL(blob);
      
      // 3. Tạo thẻ a để tải xuống
      const a = document.createElement("a");
      a.href = url;
      
      // --- QUAN TRỌNG: Đổi đuôi file thành .pdf ---
      const date = new Date().toISOString().split("T")[0];
      a.download = `dashboard_${selectedType}_${date}.pdf`; 
      
      document.body.appendChild(a);
      a.click();
      
      // 4. Dọn dẹp
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Xuất file PDF thành công");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || "Không thể xuất dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex flex-col space-y-1 w-full sm:w-auto">
             <h3 className="font-semibold text-sm">Xuất báo cáo hệ thống</h3>
             <p className="text-xs text-muted-foreground">Tải xuống báo cáo chi tiết dạng PDF.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-[280px]">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại báo cáo" />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleExport} disabled={loading} className="min-w-[130px]">
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                </>
            ) : (
                <>
                    <FileDown className="h-4 w-4 mr-2" />
                    Xuất PDF
                </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}