import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  BookOpen,
  FileText,
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

export default function DetailedStatsGrid({ overview }) {
  return (
    <>
      {/* First Row: Users, Courses, Quizzes */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng</span>
                <span className="font-medium">{overview.users.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hoạt động</span>
                <span className="font-medium text-green-600">
                  {overview.users.active}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã xác minh</span>
                <span className="font-medium">{overview.users.verified}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Không hoạt động</span>
                <span className="font-medium text-orange-600">
                  {overview.users.inactive}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tăng tuần</span>
                <Badge variant="secondary">+{overview.users.weekGrowth}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">% Hoạt động</span>
                <Badge variant="outline">{overview.users.activePercentage}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Khóa học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng khóa</span>
                <span className="font-medium">{overview.courses.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã xuất bản</span>
                <span className="font-medium text-green-600">
                  {overview.courses.published}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bản nháp</span>
                <span className="font-medium text-orange-600">
                  {overview.courses.draft}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã lưu trữ</span>
                <span className="font-medium">{overview.courses.archived}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modules</span>
                <span className="font-medium">{overview.courses.totalModules}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bài học</span>
                <span className="font-medium">{overview.courses.totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Miễn phí</span>
                <Badge variant="secondary">
                  {overview.courses.freeLessons} (
                  {overview.courses.freeLessonsPercentage}%)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Đề thi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng đề</span>
                <span className="font-medium">{overview.quizzes.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listening</span>
                <Badge variant="outline">{overview.quizzes.byListening}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reading</span>
                <Badge variant="outline">{overview.quizzes.byReading}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Writing</span>
                <Badge variant="outline">{overview.quizzes.byWriting}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Speaking</span>
                <Badge variant="outline">{overview.quizzes.bySpeaking}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Câu hỏi</span>
                <span className="font-medium">{overview.quizzes.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã xuất bản</span>
                <Badge variant="secondary">{overview.quizzes.published}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Revenue, Orders, Learning */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tháng này</span>
                <span className="font-bold text-green-600">
                  {(overview.revenue.totalCentsThisMonth || 0).toLocaleString()} {overview.revenue.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tăng trưởng</span>
                <Badge
                  variant={
                    overview.revenue.growthPercentage >= 0 ? "default" : "destructive"
                  }
                >
                  {overview.revenue.growthPercentage >= 0 ? "+" : ""}
                  {overview.revenue.growthPercentage}%
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">VND</span>
                <span className="font-medium">
                  {overview.revenue.vndPercentage}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">USD</span>
                <span className="font-medium">
                  {overview.revenue.usdPercentage}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Đơn hàng & Thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đơn tháng này</span>
                <span className="font-medium">{overview.orders.totalThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hoàn tất</span>
                <span className="font-medium text-green-600">
                  {overview.orders.completed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chờ xử lý</span>
                <span className="font-medium text-orange-600">
                  {overview.orders.pending}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã hủy</span>
                <span className="font-medium">{overview.orders.cancelled}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thanh toán</span>
                <Badge variant="outline">{overview.payments.totalPayments}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tỷ lệ thành công</span>
                <Badge variant="secondary">{overview.payments.successRate}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Học tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đăng ký</span>
                <span className="font-medium">{overview.learning.totalEnrollments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hoàn thành</span>
                <span className="font-medium text-green-600">
                  {overview.learning.completed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm dừng</span>
                <span className="font-medium">{overview.learning.suspended}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lượt thi</span>
                <span className="font-medium">{overview.learning.totalAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đang chấm</span>
                <Badge variant="secondary">
                  {overview.learning.attemptsGrading}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progress TB</span>
                <Badge variant="outline">
                  {overview.learning.averageProgress}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
