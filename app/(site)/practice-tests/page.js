"use client";
import React from "react";
import { BookOpen, Clock, Play, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Practice = () => {
  const examTypes = [
    {
      title: "TOEIC Listening",
      description: "Luyện tập kỹ năng nghe với 100 đề thi thực hành",
      duration: "45 phút",
      questions: 100,
      difficulty: "Cơ bản - Nâng cao"
    },
    {
      title: "TOEIC Reading", 
      description: "Phát triển kỹ năng đọc hiểu với đề thi đa dạng",
      duration: "75 phút",
      questions: 100,
      difficulty: "Cơ bản - Nâng cao"
    },
    {
      title: "Full Test TOEIC",
      description: "Thi thử đầy đủ với điều kiện thi thật",
      duration: "120 phút", 
      questions: 200,
      difficulty: "Thực chiến"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
<div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Luyện tập</h1>
          <p className="text-xl text-muted-foreground">
            Chọn loại đề thi phù hợp với mục tiêu của bạn
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examTypes.map((exam, index) => (
            <Card key={index} className="hover:shadow-elegant transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{exam.title}</CardTitle>
                <p className="text-muted-foreground">{exam.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Thời gian: {exam.duration}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Target className="w-4 h-4 text-primary" />
                  <span>Câu hỏi: {exam.questions}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Độ khó: </span>
                  <span className="text-black font-medium">{exam.difficulty}</span>
                </div>
                <Button className="w-full" size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Bắt đầu luyện tập
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Practice;