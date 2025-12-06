import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function ContentForumSection({ overview }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" /> Nội dung & Diễn đàn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Blog Posts</p>
            <p className="text-2xl font-bold">{overview.content.totalBlogPosts}</p>
            <p className="text-xs text-muted-foreground">
              {overview.content.publishedPosts} đã xuất bản
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Forum Threads</p>
            <p className="text-2xl font-bold">{overview.content.totalThreads}</p>
            <p className="text-xs text-muted-foreground">
              {overview.content.lockedThreads} đã khóa
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Forum Posts</p>
            <p className="text-2xl font-bold">{overview.content.totalForumPosts}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Comments</p>
            <p className="text-2xl font-bold">{overview.content.totalComments}</p>
            <p className="text-xs text-muted-foreground">
              {overview.content.totalViews} lượt xem
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
