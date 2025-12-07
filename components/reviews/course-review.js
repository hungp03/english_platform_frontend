"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Star, Loader2, Pencil, Trash2, ChevronDown } from "lucide-react";
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

import {
  getPublicCourseReviews,
  getCourseReviewStats,
  createReview,
  getMyReview,
  updateReview,
  deleteReview,
} from "@/lib/api/review";

// Cấu hình số lượng review tải mỗi lần
const PAGE_SIZE = 20;

export default function CourseReviews({ courseId }) {
  const { user } = useAuthStore();

  // --- STATE DỮ LIỆU ---
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]); // Danh sách review tổng
  const [myReview, setMyReview] = useState(null); // Review của user hiện tại

  // --- STATE PHÂN TRANG & LOADING ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false); // Kiểm tra còn dữ liệu để tải không
  const [loading, setLoading] = useState(true); // Loading lần đầu vào trang
  const [loadingMore, setLoadingMore] = useState(false); // Loading khi bấm nút xem thêm

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

  // 1. HÀM TẢI DỮ LIỆU LẦN ĐẦU (Init)
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
        
        // Nếu số lượng lấy về >= PAGE_SIZE thì khả năng cao là còn trang sau
        setHasMore(resultList.length >= PAGE_SIZE);
      }

      // Nếu đã đăng nhập thì lấy review cá nhân
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

  // 2. HÀM TẢI THÊM (Load More)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await getPublicCourseReviews(courseId, { page: nextPage, size: PAGE_SIZE });

      if (res.success) {
        const data = res.data;
        const newReviews = Array.isArray(data) ? data : (data?.result || []);

        // Nối review mới vào danh sách cũ
        setReviews((prev) => [...prev, ...newReviews]);
        setPage(nextPage);

        // Nếu lấy về ít hơn size yêu cầu -> Hết dữ liệu
        if (newReviews.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Không thể tải thêm đánh giá");
    } finally {
      setLoadingMore(false);
    }
  };

  // --- XỬ LÝ TẠO MỚI ---
  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Vui lòng viết nội dung đánh giá");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createReview(courseId, { rating, comment });
      if (res.success) {
        toast.success("Đánh giá thành công!");
        setShowForm(false);
        setComment("");
        setRating(5);
        fetchData(); // Load lại toàn bộ để cập nhật Stats và MyReview
      } else {
        toast.error(res.error || "Gửi đánh giá thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  // --- XỬ LÝ BẮT ĐẦU SỬA ---
  const handleStartEdit = () => {
    if (myReview) {
      setEditRating(myReview.rating);
      setEditComment(myReview.comment);
      setIsEditing(true);
    }
  };

  // --- XỬ LÝ CẬP NHẬT ---
  const handleUpdate = async () => {
    if (!editComment.trim()) {
      toast.error("Nội dung không được để trống");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updateReview(myReview.id, {
        rating: editRating,
        comment: editComment,
      });
      if (res.success) {
        toast.success("Cập nhật đánh giá thành công");
        setIsEditing(false);
        fetchData(); // Load lại
      } else {
        toast.error(res.error || "Cập nhật thất bại");
      }
    } catch (e) {
      toast.error("Lỗi hệ thống");
    } finally {
      setSubmitting(false);
    }
  };

  // --- XỬ LÝ XÓA ---
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteReview(myReview.id);
      if (res.success) {
        toast.success("Đã xóa đánh giá");
        setMyReview(null);
        setDeleteDialogOpen(false);
        fetchData(); // Load lại
      } else {
        toast.error(res.error || "Xóa thất bại");
      }
    } catch (e) {
      toast.error("Lỗi hệ thống");
    } finally {
      setDeleting(false);
    }
  };

  // --- GIAO DIỆN LOADING INIT ---
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải đánh giá...</span>
      </div>
    );
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h3 className="text-2xl font-bold text-foreground">Đánh giá từ học viên</h3>

      {/* 1. Thống kê */}
      <ReviewStats stats={stats} />

      <div className="border-t" />

      {/* 2. Nút viết review (Hiện khi user login + chưa có review) */}
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

      {/* 3. Form tạo mới */}
      {showForm && (
        <div className="bg-card p-6 rounded-lg space-y-4 border shadow-sm">
          <h4 className="font-semibold text-lg">Đánh giá khóa học này</h4>
          <div className="space-y-2">
            <span className="text-sm font-medium">Bạn chấm mấy sao?</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    fill={star <= rating ? "currentColor" : "none"}
                    className={
                      star <= rating ? "text-yellow-500" : "text-muted-foreground/20"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Nội dung khóa học như thế nào? Giảng viên ra sao?..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="bg-background resize-none"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Gửi đánh giá
            </Button>
          </div>
        </div>
      )}

      {/* 4. Đánh giá CỦA TÔI (Hiện/Sửa/Xóa) */}
      {myReview && (
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 relative">
          {/* Badge "Đánh giá của bạn" */}
          <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            Đánh giá của bạn
          </div>

          {isEditing ? (
            // --- CHẾ ĐỘ SỬA ---
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={24}
                      fill={star <= editRating ? "currentColor" : "none"}
                      className={
                        star <= editRating
                          ? "text-yellow-500"
                          : "text-muted-foreground/20"
                      }
                    />
                  </button>
                ))}
              </div>
              <Textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={3}
                className="bg-background"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button size="sm" onClick={handleUpdate} disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          ) : (
            // --- CHẾ ĐỘ XEM CỦA TÔI ---
            <div className="mt-2">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border bg-background">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">
                      {user?.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {myReview.updatedAt &&
                        formatDistanceToNow(new Date(myReview.updatedAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      {myReview.updatedAt !== myReview.createdAt && " • Đã chỉnh sửa"}
                    </div>
                  </div>
                </div>
                
                {/* Actions Button */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={handleStartEdit}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <StarRating rating={myReview.rating} size={16} />
              <p className="text-sm text-foreground mt-3 leading-relaxed whitespace-pre-wrap">
                {myReview.comment}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. Danh sách Review KHÁC */}
      <div className="space-y-6">
        {reviews
            // Lọc bỏ review của chính mình để tránh hiển thị trùng lặp (vì MyReview đã hiện ở trên)
            // .filter(r => r.userId !== user?.id && r.id !== myReview?.id)
            .map((review) => (
          <div
            key={review.id}
            className="flex gap-4 pb-6 border-b last:border-0 last:pb-0"
          >
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={review.userAvatarUrl} />
              <AvatarFallback>
                {review.userName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <div className="flex justify-between items-start">
                <div className="font-semibold text-sm">{review.userName}</div>
                <div className="text-xs text-muted-foreground">
                  {review.createdAt &&
                    formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                </div>
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

      {/* 6. Nút LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center pt-4 pb-8">
          <Button
            variant="ghost"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải thêm...
              </>
            ) : (
              <>
                Xem thêm đánh giá cũ hơn
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Dialog Xác nhận Xóa */}
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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}