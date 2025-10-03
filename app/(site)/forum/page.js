"use client";
import React from "react";
import { MessageSquare, ThumbsUp, Reply, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Forum = () => {
  const categories = [
    { name: "Câu hỏi chung", posts: 245, color: "bg-primary" },
    { name: "Grammar", posts: 189, color: "bg-green" },
    { name: "Listening Tips", posts: 156, color: "bg-primary" },
    { name: "Reading Skills", posts: 134, color: "bg-green" }
  ];

  const recentPosts = [
    {
      title: "Làm thế nào để cải thiện kỹ năng nghe?",
      author: "Minh Anh",
      category: "Listening Tips",
      replies: 12,
      likes: 25,
      time: "2 giờ trước",
      excerpt: "Mình đang gặp khó khăn với phần Listening trong TOEIC. Các bạn có thể chia sẻ kinh nghiệm..."
    },
    {
      title: "Phân biệt Present Perfect và Past Simple",
      author: "Văn Đức",
      category: "Grammar", 
      replies: 8,
      likes: 18,
      time: "4 giờ trước",
      excerpt: "Mình thường bị nhầm lẫn giữa hai thì này. Có ai giải thích giúp mình được không?"
    },
    {
      title: "Tài liệu ôn thi TOEIC miễn phí",
      author: "Thu Hà",
      category: "Câu hỏi chung",
      replies: 32,
      likes: 67,
      time: "1 ngày trước",
      excerpt: "Mình sưu tầm được một số tài liệu hay, chia sẻ cho mọi người cùng học..."
    },
    {
      title: "Chiến thuật làm bài Reading hiệu quả",
      author: "Hoàng Nam",
      category: "Reading Skills",
      replies: 15,
      likes: 41,
      time: "2 ngày trước",
      excerpt: "Sau 6 tháng luyện tập, mình đã tìm ra được phương pháp làm bài Reading..."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
<div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Forum</h1>
            <p className="text-xl text-muted-foreground">
              Cộng đồng học tiếng Anh sôi động
            </p>
          </div>
          <Button size="lg">
            <MessageSquare className="w-4 h-4 mr-2" />
            Đăng bài mới
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Danh mục</h2>
            <div className="space-y-3">
              {categories.map((category, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-soft transition-smooth">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <div className="flex-1">
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.posts} bài viết</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-semibold mb-6">Bài viết gần đây</h2>
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <Link key={index} href={`/forum/${index + 1}`} className="block">
                  <Card className="hover:shadow-soft transition-smooth cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {post.category}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {post.time}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Bởi <span className="font-medium text-foreground">{post.author}</span></span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Reply className="w-4 h-4" />
                              <span>{post.replies}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{post.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;