"use client";
import React from "react";
import { BarChart3, Users, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminSidebar from "@/components/common/AdminSidebar";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Tổng người dùng",
      value: "12,543",
      change: "+12%",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Đề thi đã tạo", 
      value: "1,247",
      change: "+8%",
      icon: FileText,
      color: "text-accent"
    },
    {
      title: "Lượt thi tuần này",
      value: "8,932",
      change: "+24%", 
      icon: TrendingUp,
      color: "text-primary-variant"
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: "87%",
      change: "+5%",
      icon: BarChart3,
      color: "text-accent"
    }
  ];

  const recentActivities = [
    "Người dùng mới đăng ký: nguyenvan@email.com",
    "Đề thi mới được tạo: TOEIC Full Test #125",
    "Báo cáo forum mới từ người dùng ID: 8845",
    "Blog mới được đăng: Tips luyện Listening hiệu quả",
    "Cập nhật điểm số: Lớp học buổi sáng"
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Tổng quan</h1>
          <p className="text-xl text-muted-foreground">
            Bảng điều khiển quản trị hệ thống
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-accent font-medium">
                    {stat.change} từ tháng trước
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activities */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">{activity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Đăng ký mới hôm nay:</span>
                <span className="font-bold">23</span>
              </div>
              <div className="flex justify-between">
                <span>Lượt thi hôm nay:</span>
                <span className="font-bold">156</span>
              </div>
              <div className="flex justify-between">
                <span>Báo cáo chờ xử lý:</span>
                <span className="font-bold text-destructive">4</span>
              </div>
              <div className="flex justify-between">
                <span>Blog chờ duyệt:</span>
                <span className="font-bold text-accent">7</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;