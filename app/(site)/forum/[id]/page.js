"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, User, MessageSquare, Heart, ChevronLeft, Reply } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

const ForumDetail = () => {
  const { id } = useParams();

  const forumPost = {
    id: 1,
    title: "Làm thế nào để cải thiện pronunciation trong tiếng Anh?",
    content: `Xin chào các bạn,

Mình đang gặp khó khăn trong việc phát âm tiếng Anh. Mặc dù đã học tiếng Anh khá lâu và có thể đọc hiểu tốt, nhưng khi nói thì pronunciation vẫn chưa được chuẩn, đặc biệt là các âm như /θ/, /ð/, /r/, /l/.

Mình đã thử nhiều cách như:
- Xem video trên YouTube
- Luyện tập với mirror
- Sử dụng app phát âm

Nhưng vẫn chưa thấy cải thiện rõ rệt. Các bạn có kinh nghiệm gì hay phương pháp nào hiệu quả không? Mình rất mong được chia sẻ từ các bạn.

Cảm ơn các bạn!`,
    author: "Nguyễn Văn An",
    authorAvatar: "/placeholder.svg",
    publishDate: "2024-03-15 14:30",
    category: "Speaking",
    views: 156,
    likes: 23,
    replies: 8
  };

  const comments = [
    {
      id: 1,
      author: "Trần Thị Lan",
      authorAvatar: "/placeholder.svg",
      content: `Mình cũng từng gặp vấn đề tương tự. Theo kinh nghiệm của mình, bạn nên:

1. Tập trung vào từng âm một cách riêng biệt
2. Sử dụng International Phonetic Alphabet (IPA) để hiểu rõ cách phát âm
3. Luyện tập với shadowing technique - nghe và nhắc lại ngay lập tức

Đặc biệt với âm /θ/ và /ð/, bạn cần đặt lưỡi giữa răng và thổi nhẹ. Mình đã luyện tập cách này trong 2 tuần và thấy cải thiện rõ rệt.`,
      publishDate: "2024-03-15 15:45",
      likes: 12
    },
    {
      id: 2,
      author: "Lê Minh Tuấn",
      authorAvatar: "/placeholder.svg",
      content: `@Trần Thị Lan có nói đúng về shadowing technique. Ngoài ra mình muốn bổ sung thêm:

- Sử dụng app Sounds Pronunciation để luyện tập từng âm
- Ghi âm giọng nói của mình và so sánh với native speaker
- Tham gia speaking club để được feedback trực tiếp

Mình recommend bạn xem kênh YouTube "Rachel's English" - rất chi tiết về mouth movement.`,
      publishDate: "2024-03-15 16:20",
      likes: 8
    },
    {
      id: 3,
      author: "Phạm Thu Hương",
      authorAvatar: "/placeholder.svg",
      content: `Mình thấy pronunciation là skill cần thời gian và kiên trì. Ngoài những cách các bạn đã chia sẻ, mình còn:

- Đọc to sách tiếng Anh mỗi ngày 15-20 phút
- Xem phim không phụ đề và cố gắng bắt chước cách nói
- Sử dụng Google Translate để check pronunciation

Quan trọng là đừng nản lòng, cứ luyện đều đặn sẽ thấy kết quả!`,
      publishDate: "2024-03-15 17:10",
      likes: 15
    }
  ];

  return (
    <div className="min-h-screen bg-background">
<main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/forum">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại Forum
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Original Post */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{forumPost.category}</Badge>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{forumPost.replies}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{forumPost.likes}</span>
                    </div>
                  </div>
                </div>
                
                <CardTitle className="text-2xl">{forumPost.title}</CardTitle>
                
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={forumPost.authorAvatar} />
                    <AvatarFallback>{forumPost.author.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{forumPost.author}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{forumPost.publishDate}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose max-w-none mb-6">
                  <div className="whitespace-pre-line">{forumPost.content}</div>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Thích ({forumPost.likes})
                  </Button>
                  <Button variant="outline" size="sm">
                    <Reply className="w-4 h-4 mr-2" />
                    Trả lời
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Bình luận ({comments.length})</CardTitle>
              </CardHeader>
              
              <CardContent>
                {/* Reply Form */}
                <div className="mb-6 pb-6 border-b">
                  <Textarea 
                    placeholder="Viết bình luận của bạn..."
                    className="mb-3"
                  />
                  <Button>Gửi bình luận</Button>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarImage src={comment.authorAvatar} />
                          <AvatarFallback>{comment.author.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">{comment.author}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{comment.publishDate}</span>
                            </div>
                          </div>
                          
                          <div className="prose prose-sm max-w-none mb-3">
                            <div className="whitespace-pre-line">{comment.content}</div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm">
                              <Heart className="w-4 h-4 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Reply className="w-4 h-4 mr-1" />
                              Trả lời
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin bài viết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tác giả</p>
                    <p className="font-medium">{forumPost.author}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Danh mục</p>
                    <Badge variant="secondary">{forumPost.category}</Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian đăng</p>
                    <p className="text-sm">{forumPost.publishDate}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Lượt xem</p>
                    <p className="text-sm">{forumPost.views}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Lượt thích</p>
                    <p className="text-sm">{forumPost.likes}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Bình luận</p>
                    <p className="text-sm">{forumPost.replies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForumDetail;