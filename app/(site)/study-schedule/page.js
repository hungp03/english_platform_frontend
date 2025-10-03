"use client";
import React from "react";
import { Calendar, Clock, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Schedule = () => {
  const upcomingClasses = [
    {
      title: "TOEIC Listening Practice",
      time: "09:00 - 10:30",
      date: "Hôm nay",
      instructor: "Thầy Minh",
      status: "upcoming"
    },
    {
      title: "Grammar Review Session",
      time: "14:00 - 15:30", 
      date: "Hôm nay",
      instructor: "Cô Lan",
      status: "upcoming"
    },
    {
      title: "Speaking Workshop",
      time: "19:00 - 20:30",
      date: "Mai",
      instructor: "Thầy John",
      status: "scheduled"
    },
    {
      title: "Full Mock Test",
      time: "08:00 - 11:00",
      date: "Thứ 7",
      instructor: "Cô Hoa",
      status: "scheduled"
    }
  ];

  const completedClasses = [
    {
      title: "Reading Comprehension",
      time: "09:00 - 10:30",
      date: "Hôm qua",
      score: "85/100"
    },
    {
      title: "Vocabulary Building",
      time: "14:00 - 15:30",
      date: "Thứ 2",
      score: "92/100"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
<div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Lịch học</h1>
          <p className="text-xl text-muted-foreground">
            Quản lý và theo dõi lịch học của bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Classes */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Lịch học sắp tới</h2>
            <div className="space-y-4">
              {upcomingClasses.map((class_, index) => (
                <Card key={index} className="hover:shadow-soft transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{class_.title}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{class_.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{class_.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span>Giảng viên: {class_.instructor}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {class_.status === "upcoming" && (
                          <Button size="sm">
                            Tham gia
                          </Button>
                        )}
                        {class_.status === "scheduled" && (
                          <Button variant="outline" size="sm">
                            Đã đăng ký
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Completed Classes & Stats */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê tuần này</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Lớp đã hoàn thành:</span>
                  <span className="font-bold">8/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Điểm trung bình:</span>
                  <span className="font-bold text-accent">88.5</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian học:</span>
                  <span className="font-bold">12h 30m</span>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-4">Lớp đã hoàn thành</h3>
              <div className="space-y-3">
                {completedClasses.map((class_, index) => (
                  <Card key={index} className="bg-accent/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium mb-1">{class_.title}</h4>
                          <p className="text-sm text-muted-foreground">{class_.date} • {class_.time}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium">{class_.score}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;