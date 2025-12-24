"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
// THÊM: Import Flag icon
import { Star, Loader2, Pencil, Trash2, ChevronDown, Flag } from "lucide-react"; 
import { toast } from "sonner";

import { ReviewStats } from "./review-stats";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// THÊM: Import Dialog cho form báo cáo
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  getPublicCourseReviews,
  getCourseReviewStats,
  createReview,
  getMyReview,
  updateReview,
  deleteReview,
} from "@/lib/api/review";

// THÊM: Import API report
import { reportReview } from "@/lib/api/forum"; 

const PAGE_SIZE = 20;

export default function CourseReviews({ courseId }) {
  const { user } = useAuthStore();

  // --- STATE DỮ LIỆU ---
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [myReview, setMyReview] = useState(null); 

  // --- STATE PHÂN TRANG & LOADING ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const [loadingMore, setLoadingMore] = useState(false); 

  // --- STATE FORM TẠO MỚI ---
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- STATE FORM CHỈNH SỬA ---
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  // --- STATE DIALOG XÓA ---
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // --- THÊM: STATE BÁO CÁO (REPORT) ---
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingId, setReportingId] = useState(null); // ID review đang báo cáo
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // ... (Giữ nguyên các hàm fetchData, handleLoadMore, handleSubmit, handleUpdate, handleDelete...)
  
  // 1. HÀM TẢI DỮ LIỆU LẦN ĐẦU (Init) - (GIỮ NGUYÊN)
  const fetchData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      setPage(1);
      const [statsRes, reviewsRes] = await Promise.all([
        getCourseReviewStats(courseId),
        getPublicCourseReviews(courseId, { page: 1, size: PAGE_SIZE }),
      ]);

      if (statsRes.success) setStats(statsRes.data);

      if (reviewsRes.success) {
        const data = reviewsRes.data;
        const resultList = Array.isArray(data) ? data : (data?.result || []);
        setReviews(resultList);
        setHasMore(resultList.length >= PAGE_SIZE);
      }

      if (user) {
        const myReviewRes = await getMyReview(courseId);
        if (myReviewRes.success) {
          setMyReview(myReviewRes.data);
        } else {
          setMyReview(null);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Không thể tải đánh giá khóa học");
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ... (Giữ nguyên handleLoadMore, handleSubmit, handleUpdate, handleDelete)
  // ... Paste lại các hàm cũ ở đây để code chạy đúng context ...
  const handleLoadMore = async () => {
     // (Code cũ)
     if (loadingMore || !hasMore) return;
     setLoadingMore(true);
     const nextPage = page + 1;
     try {
       const res = await getPublicCourseReviews(courseId, { page: nextPage, size: PAGE_SIZE });
       if (res.success) {
         const data = res.data;
         const newReviews = Array.isArray(data) ? data : (data?.result || []);
         setReviews((prev) => [...prev, ...newReviews]);
         setPage(nextPage);
         if (newReviews.length < PAGE_SIZE) setHasMore(false);
       } else {
         setHasMore(false);
       }
     } catch (error) {
       toast.error("Không thể tải thêm đánh giá");
     } finally {
       setLoadingMore(false);
     }
  };

  const handleSubmit = async () => {
    // (Code cũ)
    if (!comment.trim()) { toast.error("Vui lòng viết nội dung đánh giá"); return; }
    setSubmitting(true);
    try {
      const res = await createReview(courseId, { rating, comment });
      if (res.success) {
        toast.success("Đánh giá thành công!");
        setShowForm(false); setComment(""); setRating(5); fetchData();
      } else {
        toast.error(res.error || "Gửi đánh giá thất bại");
      }
    } catch (error) { toast.error("Có lỗi xảy ra"); } finally { setSubmitting(false); }
  };

  const handleStartEdit = () => {
    if (myReview) { setEditRating(myReview.rating); setEditComment(myReview.comment); setIsEditing(true); }
  };

  const handleUpdate = async () => {
    // (Code cũ)
    if (!editComment.trim()) { toast.error("Nội dung không được để trống"); return; }
    setSubmitting(true);
    try {
      const res = await updateReview(myReview.id, { rating: editRating, comment: editComment });
      if (res.success) {
        toast.success("Cập nhật đánh giá thành công"); setIsEditing(false); fetchData();
      } else {
        toast.error(res.error || "Cập nhật thất bại");
      }
    } catch (e) { toast.error("Lỗi hệ thống"); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    // (Code cũ)
    setDeleting(true);
    try {
      const res = await deleteReview(myReview.id);
      if (res.success) {
        toast.success("Đã xóa đánh giá"); setMyReview(null); setDeleteDialogOpen(false); fetchData();
      } else {
        toast.error(res.error || "Xóa thất bại");
      }
    } catch (e) { toast.error("Lỗi hệ thống"); } finally { setDeleting(false); }
  };


  // --- THÊM: HÀM XỬ LÝ REPORT ---
  const handleOpenReport = (reviewId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để báo cáo.");
      return;
    }
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
      const res = await reportReview(reportingId, reportReason);
      if (res.success) {
        toast.success("Đã gửi báo cáo. Chúng tôi sẽ xem xét sớm.");
        setReportDialogOpen(false);
      } else {
        toast.error(res.error || "Không thể gửi báo cáo.");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setIsReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải đánh giá...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h3 className="text-2xl font-bold text-foreground">Đánh giá từ học viên</h3>

      {/* 1. Thống kê */}
      <ReviewStats stats={stats} />

      <div className="border-t" />

      {/* 2. Nút viết review (Giữ nguyên) */}
      {user && !myReview && !showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline">
          <Pencil className="w-4 h-4 mr-2" />
          Viết đánh giá
        </Button>
      )}

      {!user && (
        <div className="bg-muted/30 p-4 rounded-lg text-center text-sm text-muted-foreground border border-dashed">
          Hãy đăng nhập và tham gia khóa học để chia sẻ cảm nhận của bạn.
        </div>
      )}

      {/* 3. Form tạo mới (Giữ nguyên) */}
      {showForm && (
        <div className="bg-card p-6 rounded-lg space-y-4 border shadow-sm">
             {/* ... (Giữ nguyên UI Form) ... */}
             <h4 className="font-semibold text-lg">Đánh giá khóa học này</h4>
             <div className="space-y-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star size={28} fill={star <= rating ? "currentColor" : "none"} className={star <= rating ? "text-yellow-500" : "text-muted-foreground/20"} />
                    </button>
                  ))}
                </div>
             </div>
             <Textarea placeholder="Nội dung khóa học như thế nào?..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="bg-background resize-none" />
             <div className="flex gap-2 justify-end">
               <Button variant="ghost" onClick={() => setShowForm(false)} disabled={submitting}>Hủy</Button>
               <Button onClick={handleSubmit} disabled={submitting}>
                 {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Gửi đánh giá
               </Button>
             </div>
        </div>
      )}

      {/* 4. Review CỦA TÔI (Giữ nguyên) */}
      {myReview && (
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 relative">
             {/* ... (Giữ nguyên UI MyReview) ... */}
             <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">Đánh giá của bạn</div>
             {isEditing ? (
                <div className="space-y-4 mt-2">
                   {/* Form Edit */}
                   <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setEditRating(star)} className="focus:outline-none">
                           <Star size={24} fill={star <= editRating ? "currentColor" : "none"} className={star <= editRating ? "text-yellow-500" : "text-muted-foreground/20"} />
                        </button>
                      ))}
                   </div>
                   <Textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={3} className="bg-background" />
                   <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={submitting}>Hủy</Button>
                      <Button size="sm" onClick={handleUpdate} disabled={submitting}>{submitting ? "Đang lưu..." : "Lưu thay đổi"}</Button>
                   </div>
                </div>
             ) : (
                <div className="mt-2">
                   <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10 border bg-background">
                            <AvatarImage src={user?.avatarUrl} />
                            <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
                         </Avatar>
                         <div>
                            <div className="font-semibold text-sm">{user?.fullName}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                               {myReview.updatedAt && formatDistanceToNow(new Date(myReview.updatedAt), { addSuffix: true, locale: vi })}
                               {myReview.updatedAt !== myReview.createdAt && " • Đã chỉnh sửa"}
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-1">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handleStartEdit}><Pencil className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteDialogOpen(true)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                   </div>
                   <StarRating rating={myReview.rating} size={16} />
                   <p className="text-sm text-foreground mt-3 leading-relaxed whitespace-pre-wrap">{myReview.comment}</p>
                </div>
             )}
        </div>
      )}

      {/* 5. Danh sách Review KHÁC (SỬA ĐỂ THÊM NÚT REPORT) */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex gap-4 pb-6 border-b last:border-0 last:pb-0 group" 
          >
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={review.userAvatarUrl} />
              <AvatarFallback>
                {review.userName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <div className="flex justify-between items-start">
                <div>
                    <div className="font-semibold text-sm">{review.userName}</div>
                    <div className="text-xs text-muted-foreground">
                        {review.createdAt &&
                            formatDistanceToNow(new Date(review.createdAt), {
                            addSuffix: true,
                            locale: vi,
                            })}
                    </div>
                </div>

                {/* THÊM: Nút Report (Chỉ hiện khi user đã đăng nhập và không phải review của chính mình) */}
                {user && user.id !== review.userId && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Báo cáo đánh giá này"
                        onClick={() => handleOpenReport(review.id)}
                    >
                        <Flag className="h-4 w-4" />
                    </Button>
                )}
              </div>
              <StarRating rating={review.rating} size={14} />
              <p className="text-sm text-foreground mt-2 leading-relaxed whitespace-pre-line">
                {review.comment}
              </p>
            </div>
          </div>
        ))}

        {reviews.length === 0 && !myReview && (
          <div className="flex flex-col items-center justify-center py-10 bg-muted/10 rounded-lg border border-dashed text-center">
            <p className="text-muted-foreground mb-2">Chưa có đánh giá nào.</p>
            <p className="text-xs text-muted-foreground/70">Hãy là người đầu tiên đánh giá khóa học này!</p>
          </div>
        )}
      </div>

      {/* 6. Nút LOAD MORE (Giữ nguyên) */}
      {hasMore && (
         <div className="flex justify-center pt-4 pb-8">
            <Button variant="ghost" onClick={handleLoadMore} disabled={loadingMore} className="w-full sm:w-auto text-muted-foreground hover:text-foreground">
               {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải thêm...</> : <><span className="mr-2">Xem thêm đánh giá cũ hơn</span> <ChevronDown className="h-4 w-4" /></>}
            </Button>
         </div>
      )}

      {/* Dialog Xác nhận Xóa (Giữ nguyên) */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đánh giá?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={deleting}>
              {deleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* THÊM: Dialog Báo Cáo */}
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