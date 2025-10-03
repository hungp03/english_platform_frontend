"use client";
import React from "react";
import { Flag, User, MessageSquare, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminSidebar from "@/components/common/AdminSidebar";

const ReportManagement = () => {
  const reports = [
    {
      id: 1,
      reportedBy: "Nguyễn Văn An",
      reportedUser: "Trần Thị B",
      postTitle: "Cách học từ vựng hiệu quả",
      reason: "Spam",
      description: "Đăng quá nhiều bài liên tục không liên quan đến chủ đề",
      reportDate: "15/03/2024 14:30",
      status: "Chờ xử lý",
      priority: "Cao"
    },
    {
      id: 2,
      reportedBy: "Lê Thị C",
      reportedUser: "Phạm Văn D", 
      postTitle: "Chia sẻ tài liệu luyện thi",
      reason: "Nội dung không phù hợp",
      description: "Sử dụng ngôn từ không lịch sự trong bình luận",
      reportDate: "14/03/2024 09:15",
      status: "Đang xử lý",
      priority: "Trung bình"
    },
    {
      id: 3,
      reportedBy: "Hoàng Minh E",
      reportedUser: "Đỗ Thị F",
      postTitle: "Hỏi về cấu trúc câu",
      reason: "Vi phạm bản quyền",
      description: "Chia sẻ tài liệu có bản quyền mà không được phép",
      reportDate: "13/03/2024 16:45",
      status: "Đã xử lý",
      priority: "Thấp"
    },
    {
      id: 4,
      reportedBy: "Vũ Văn G",
      reportedUser: "Bùi Thị H",
      postTitle: "Thảo luận về đề thi",
      reason: "Quấy rối",
      description: "Liên tục gửi tin nhắn riêng quấy rối người khác",
      reportDate: "12/03/2024 11:20",
      status: "Chờ xử lý",
      priority: "Cao"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã xử lý":
        return "bg-green/10 text-green";
      case "Đang xử lý":
        return "bg-primary/10 text-primary";
      case "Chờ xử lý":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Cao":
        return "bg-destructive/10 text-destructive";
      case "Trung bình":
        return "bg-primary/10 text-primary";
      case "Thấp":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Quản lí report forum</h1>
          <p className="text-xl text-muted-foreground">
            Xử lý các báo cáo vi phạm trong forum
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng báo cáo</CardTitle>
              <Flag className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-green font-medium">+4 tuần này</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
              <Flag className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-destructive font-medium">Cần xử lý ngay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
              <Flag className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-primary font-medium">Đang điều tra</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã xử lý</CardTitle>
              <Flag className="w-4 h-4 text-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">72</div>
              <p className="text-xs text-green font-medium">80.9% tổng số</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách báo cáo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="p-6 border rounded-lg hover:shadow-soft transition-smooth">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{report.postTitle}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(report.priority)}`}>
                          Ưu tiên {report.priority.toLowerCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>Báo cáo bởi: <span className="font-medium">{report.reportedBy}</span></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>Đối tượng: <span className="font-medium">{report.reportedUser}</span></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Flag className="w-4 h-4 text-muted-foreground" />
                          <span>Lý do: <span className="font-medium">{report.reason}</span></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <span>Thời gian: <span className="font-medium">{report.reportDate}</span></span>
                        </div>
                      </div>
                      <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        <span className="font-medium">Mô tả: </span>{report.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                    {report.status === "Chờ xử lý" && (
                      <>
                        <Button variant="outline" size="sm">
                          Bắt đầu xử lý
                        </Button>
                        <Button size="sm" className="bg-green text-white hover:bg-green/90">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Chấp nhận
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <X className="w-4 h-4 mr-2" />
                          Từ chối
                        </Button>
                      </>
                    )}
                    {report.status === "Đang xử lý" && (
                      <Button size="sm" className="bg-green text-white hover:bg-green/90">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Hoàn tất
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportManagement;
