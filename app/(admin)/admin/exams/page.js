"use client";
import React from "react";
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminSidebar from "@/components/common/AdminSidebar";

const ExamManagement = () => {
  const exams = [
    {
      id: 1,
      title: "TOEIC Full Test #125",
      type: "Full Test",
      questions: 200,
      duration: 120,
      difficulty: "Trung bình",
      status: "Đã xuất bản",
      attempts: 1234
    },
    {
      id: 2,
      title: "Listening Practice Set A",
      type: "Listening",
      questions: 100,
      duration: 45,
      difficulty: "Dễ",
      status: "Đã xuất bản", 
      attempts: 856
    },
    {
      id: 3,
      title: "Reading Comprehension Advanced",
      type: "Reading",
      questions: 75,
      duration: 75,
      difficulty: "Khó",
      status: "Nháp",
      attempts: 0
    },
    {
      id: 4,
      title: "Grammar Focus Test",
      type: "Grammar",
      questions: 50,
      duration: 30,
      difficulty: "Trung bình",
      status: "Đã xuất bản",
      attempts: 492
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã xuất bản":
        return "bg-accent/10 text-accent";
      case "Nháp":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Quản lí đề thi</h1>
            <p className="text-xl text-muted-foreground">
              Tạo và quản lý đề thi trong hệ thống
            </p>
          </div>
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Tạo đề thi mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng đề thi</CardTitle>
              <FileText className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-accent font-medium">+15 tuần này</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
              <FileText className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,156</div>
              <p className="text-xs text-primary font-medium">92.7% tổng số</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng lượt thi</CardTitle>
              <FileText className="w-4 h-4 text-primary-variant" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25,439</div>
              <p className="text-xs text-accent font-medium">+1,234 tuần này</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm TB</CardTitle>
              <FileText className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78.5</div>
              <p className="text-xs text-primary font-medium">+2.3 điểm</p>
            </CardContent>
          </Card>
        </div>

        {/* Exams Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đề thi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-soft transition-smooth">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{exam.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <span>Loại: <span className="text-foreground font-medium">{exam.type}</span></span>
                      <span>Câu hỏi: <span className="text-foreground font-medium">{exam.questions}</span></span>
                      <span>Thời gian: <span className="text-foreground font-medium">{exam.duration}p</span></span>
                      <span>Lượt thi: <span className="text-foreground font-medium">{exam.attempts}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

export default ExamManagement;