"use client";

import { useState } from "react";
import { Download } from "lucide-react";
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

const EXPORT_TYPES = [
  { value: "summary", label: "Tổng quan Dashboard" },
  { value: "user-growth", label: "Tăng trưởng người dùng (12 tháng)" },
  { value: "revenue", label: "Báo cáo doanh thu" },
  { value: "enrollments", label: "Báo cáo Enrollment" },
  { value: "top-courses", label: "Top 50 khóa học" },
  { value: "top-instructors", label: "Top 50 giảng viên" },
  { value: "top-revenue-courses", label: "Top 50 khóa học theo doanh thu" },
];

export default function ExportCSVSection() {
  const [selectedType, setSelectedType] = useState("summary");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!selectedType) {
      toast.error("Vui lòng chọn loại báo cáo");
      return;
    }

    setLoading(true);
    try {
      const blob = await exportDashboardData(selectedType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard_${selectedType}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Xuất CSV thành công");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || "Không thể xuất dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
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
        <Button onClick={handleExport} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? "Đang xuất..." : "Xuất CSV"}
        </Button>
      </div>
    </div>
  );
}
