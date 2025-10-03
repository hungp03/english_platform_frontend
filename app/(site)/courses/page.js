"use client";
import React from "react";
import { Play, Clock, Users, Star, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Courses = () => {
  const courses = [
    {
      id: 1,
      title: "TOEIC Complete Course - Từ 0 đến 900+",
      description: "Khóa học toàn diện về TOEIC bao gồm tất cả kỹ năng Listening, Reading với các chiến lược làm bài hiệu quả.",
      instructor: "Thầy Nguyễn Minh Hoàng",
      duration: "40 giờ",
      students: 1250,
      rating: 4.8,
      reviews: 234,
      price: "2,990,000 VNĐ",
      originalPrice: "3,990,000 VNĐ",
      thumbnail: "/placeholder.svg",
      level: "Tất cả cấp độ",
      lessons: 45,
      category: "TOEIC"
    },
    {
      id: 2,
      title: "English Speaking Masterclass",
      description: "Khóa học nâng cao kỹ năng Speaking tiếng Anh từ cơ bản đến nâng cao với phương pháp thực hành tương tác.",
      instructor: "Cô Sarah Johnson",
      duration: "25 giờ",
      students: 890,
      rating: 4.9,
      reviews: 156,
      price: "1,990,000 VNĐ",
      originalPrice: "2,490,000 VNĐ",
      thumbnail: "/placeholder.svg",
      level: "Trung cấp",
      lessons: 30,
      category: "Speaking"
    },
    {
      id: 3,
      title: "Grammar Foundation - Nền tảng Ngữ pháp",
      description: "Xây dựng nền tảng ngữ pháp vững chắc từ cơ bản đến nâng cao với hệ thống bài tập phong phú.",
      instructor: "Thầy Lê Văn Tuấn",
      duration: "30 giờ",
      students: 2100,
      rating: 4.7,
      reviews: 389,
      price: "1,490,000 VNĐ",
      originalPrice: "1,990,000 VNĐ",
      thumbnail: "/placeholder.svg",
      level: "Cơ bản",
      lessons: 35,
      category: "Grammar"
    },
    {
      id: 4,
      title: "Business English for Professionals",
      description: "Tiếng Anh chuyên ngành dành cho môi trường công sở, bao gồm email, presentation, negotiation.",
      instructor: "Cô Trần Thị Mai",
      duration: "20 giờ",
      students: 650,
      rating: 4.6,
      reviews: 98,
      price: "2,490,000 VNĐ",
      originalPrice: "2,990,000 VNĐ",
      thumbnail: "/placeholder.svg",
      level: "Nâng cao",
      lessons: 25,
      category: "Business"
    }
  ];

  const categories = [
    { name: "Tất cả", count: 24, active: true },
    { name: "TOEIC", count: 8 },
    { name: "Speaking", count: 6 },
    { name: "Grammar", count: 5 },
    { name: "Business", count: 3 },
    { name: "Vocabulary", count: 2 }
  ];

  return (
    <div className="min-h-screen bg-background">
<main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Khóa học Video</h1>
          <p className="text-muted-foreground text-lg">
            Học tiếng Anh hiệu quả với các khóa học video chất lượng cao từ các giảng viên hàng đầu
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={category.active ? "default" : "outline"}
              size="sm"
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="lg" className="rounded-full">
                      <Play className="w-6 h-6" />
                    </Button>
                  </div>
                  <Badge className="absolute top-3 left-3">
                    {course.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="mb-3">
                  <Badge variant="outline" className="mb-2">
                    {course.level}
                  </Badge>
                  <CardTitle className="text-lg line-clamp-2 mb-2">
                    {course.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                    {course.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.instructor}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      ({course.reviews} đánh giá)
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-lg font-bold text-primary">
                          {course.price}
                        </p>
                        <p className="text-sm text-muted-foreground line-through">
                          {course.originalPrice}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {course.lessons} bài học
                        </p>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Bắt đầu học
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Courses;