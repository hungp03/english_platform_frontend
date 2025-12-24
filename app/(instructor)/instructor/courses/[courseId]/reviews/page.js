"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Eye, EyeOff, Flag } from "lucide-react"; // Thêm icon Flag
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea"; // Thêm Textarea
import { 
  getInstructorCourseReviews, 
  getCourseReviewStats, 
  hideReview, 
  showReview 
} from "@/lib/api/review";
// Import API báo cáo
import { reportReview } from "@/lib/api/forum"; 

// Import Dialog Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ReviewStats } from "@/components/reviews/review-stats";
import { StarRating } from "@/components/reviews/star-rating";
import ReviewFilters from "@/components/instructor/courses/reviews/review-filters";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function InstructorCourseReviewsPage() {
  const { courseId } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    isPublished: "ALL",
    rating: "ALL"
  });

  // --- STATE CHO TÍNH NĂNG REPORT ---
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingId, setReportingId] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const loadData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const apiFilters = {};
      if (filters.isPublished !== "ALL") apiFilters.isPublished = filters.isPublished === "true";
      if (filters.rating !== "ALL") apiFilters.rating = parseInt(filters.rating);

      const [statsRes, reviewsRes] = await Promise.all([
        getCourseReviewStats(courseId),
        getInstructorCourseReviews(courseId, { 
          page: page, 
          size: 10, 
          ...apiFilters 
        }), 
      ]);

      if (statsRes.success) setStats(statsRes.data);
      
      if (reviewsRes.success) {
        const data = reviewsRes.data;
        setReviews(data?.result || []);
        setTotalPages(data?.meta?.pages || 1);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu đánh giá");
    } finally {
      setLoading(false);
    }
  }, [courseId, page, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); 
  };

  // Logic ẩn/hiện (đang giữ nguyên nhưng không dùng trên UI theo yêu cầu)
  const toggleVisibility = async (review) => {
    const action = review.isPublished ? hideReview : showReview;
    const actionName = review.isPublished ? "Ẩn" : "Hiện";
    try {
      const res = await action(review.id);
      if (res.success) {
        toast.success(`Đã ${actionName.toLowerCase()} đánh giá thành công`);
        setReviews(prev => prev.map(r => 
          r.id === review.id ? { ...r, isPublished: !r.isPublished } : r
        ));
      } else {
        toast.error(res.error || `Không thể ${actionName.toLowerCase()} đánh giá`);
      }
    } catch (err) {
      toast.error("Lỗi hệ thống");
    }
  };

  // --- LOGIC XỬ LÝ REPORT ---
  const handleOpenReport = (reviewId) => {
    setReportingId(reviewId);
    setReportReason("");
    setReportDialogOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Vui lòng nhập lý do báo cáo.");
      return;
    }
    
    setIsReporting(true);
    try {
      // Gọi API reportReview (đã import từ api/forum)
      const res = await reportReview(reportingId, reportReason);
      if (res.success) {
        toast.success("Đã gửi báo cáo thành công. Admin sẽ xem xét.");
        setReportDialogOpen(false);
      } else {
        toast.error(res.error || "Không thể gửi báo cáo.");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi báo cáo.");
    } finally {
      setIsReporting(false);
    }
  };

  if (loading && !reviews.length && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/instructor/courses`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Đánh giá của khóa học</h1>
          <p className="text-muted-foreground text-sm">
            Đánh giá từ học viên của khóa học
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle>Tổng quan đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewStats stats={stats} />
        </CardContent>
      </Card>

      <div className="border-t my-6" />

      {/* Filters & List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Danh sách chi tiết
          </h2>
        </div>

        <ReviewFilters filters={filters} onChange={handleFilterChange} />

        <div className="grid gap-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground border-dashed border-2 rounded-lg">
                Không tìm thấy đánh giá nào phù hợp với bộ lọc.
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className={`overflow-hidden transition-colors ${!review.isPublished ? 'bg-muted/40 border-dashed' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={review.userAvatarUrl} />
                      <AvatarFallback>{review.userName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      {/* Header Review */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{review.userName}</p>
                            {!review.isPublished && (
                              <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600">
                                Đã ẩn
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} size={14} />
                            <span className="text-xs text-muted-foreground">
                              • {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          
                          {/* Nút Báo cáo (MỚI) */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Báo cáo vi phạm"
                            onClick={() => handleOpenReport(review.id)}
                          >
                            <Flag className="w-4 h-4" />
                          </Button>

                          {/* Nút Ẩn/Hiện (Đang ẩn theo yêu cầu của bạn) */}
                          {/* <Button 
                            variant="ghost" 
                            size="sm" 
                            className={review.isPublished ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                            onClick={() => toggleVisibility(review)}
                          >
                            {review.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button> 
                          */}
                        </div>
                      </div>
                      
                      {/* Comment Content */}
                      <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border shadow-sm">
                        {review.comment || <span className="italic text-muted-foreground">Không có nội dung</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </div>

      {/* --- DIALOG BÁO CÁO VI PHẠM --- */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Báo cáo đánh giá</DialogTitle>
            <DialogDescription>
              Hãy cho chúng tôi biết lý do bạn báo cáo đánh giá này. Nội dung không phù hợp sẽ bị xóa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea 
                placeholder="Ví dụ: Ngôn từ đả kích, spam, không liên quan... Ít nhất 10 kí tự"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={4}
            />
            {/* THÊM: Hiển thị đếm ký tự để người dùng biết */}
            {/* <div className={`text-xs text-right transition-colors ${reportReason.trim().length <= 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {reportReason.trim().length <= 10 
                  ? `Cần thêm ${11 - reportReason.trim().length} ký tự nữa` 
                  : `${reportReason.trim().length} ký tự (Hợp lệ)`}
            </div> */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)} disabled={isReporting}>
                Hủy
            </Button>
            
            {/* SỬA: Thêm điều kiện reportReason.trim().length <= 10 vào disabled */}
            <Button 
                type="submit" 
                onClick={handleSubmitReport} 
                disabled={isReporting || reportReason.trim().length < 10}
            >
              {isReporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi báo cáo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}