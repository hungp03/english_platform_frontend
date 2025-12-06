"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, DollarSign, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getInstructorStats } from "@/lib/api/course";
import { toast } from "sonner";
import { GrowthChart } from "@/components/instructor/dashboard/growth-chart";

export default function InstructorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const result = await getInstructorStats();
      if (result.success) {
        setStats(result.data);
      } else {
        toast.error(result.error || "Không thể tải thống kê");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Đã xảy ra lỗi khi tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  const statsCards = stats ? [
    { title: "Tổng khóa học", value: stats.totalCourses, icon: BookOpen, color: "text-blue-600" },
    { title: "Khóa học đã xuất bản", value: stats.publishedCourses, icon: CheckCircle, color: "text-green-600" },
    { title: "Tổng học viên", value: stats.totalStudents, icon: Users, color: "text-purple-600" },
    { title: "Doanh thu", value: stats.formattedRevenue, icon: DollarSign, color: "text-orange-600" },
  ] : [];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Chào mừng trở lại!</h2>
        <p className="text-muted-foreground mt-1">
          Đây là tổng quan về hoạt động giảng dạy của bạn
        </p>
      </div>

      {/* --- Stats Section --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, idx) => (
              <Card key={idx} className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-5 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          statsCards.map((stat) => (
            <Card key={stat.title} className="shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* --- Growth Chart --- */}
      <GrowthChart />

      {/* --- Quick Actions --- */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/instructor/courses/new">
              <Button className="w-full" size="lg">
                <BookOpen className="mr-2 h-5 w-5" />
                Tạo khóa học mới
              </Button>
            </Link>
            <Link href="/instructor/courses">
              <Button variant="outline" className="w-full" size="lg">
                Quản lý khóa học
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
