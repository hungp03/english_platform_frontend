"use client";

import { useState, useEffect, useCallback } from "react";
import { ReviewStats } from "./review-stats";
import { StarRating } from "./star-rating";
import {
  getPublicCourseReviews,
  getCourseReviewStats,
  createReview,
  getMyReview,
  updateReview, 
  deleteReview, 
} from "@/lib/api/review";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Star, Loader2, Pencil, Trash2 } from "lucide-react"; // Import thêm icon
import { useAuthStore } from "@/store/auth-store";

export default function CourseReviews({ courseId }) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);

  // State cho form tạo mới
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State cho chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  // State cho dialog xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, reviewsRes] = await Promise.all([
        getCourseReviewStats(courseId),
        getPublicCourseReviews(courseId, { page: 0, size: 20 }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (reviewsRes.success) setReviews(reviewsRes.data?.result || []);

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
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    if (courseId) fetchData();
  }, [courseId, fetchData]);

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
        fetchData();
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
        fetchData();
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
        setMyReview(null); // Xóa khỏi state cục bộ
        setDeleteDialogOpen(false);
        fetchData(); // Load lại list & stats
      } else {
        toast.error(res.error || "Xóa thất bại");
      }
    } catch (e) {
      toast.error("Lỗi hệ thống");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Đang tải đánh giá...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-foreground">Đánh giá từ học viên</h3>

      {/* 1. Thống kê */}
      <ReviewStats stats={stats} />

      <div className="border-t" />

      {/* 2. Nút viết review (chỉ hiện khi login + chưa review) */}
      {user && !myReview && !showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline">
          Viết đánh giá
        </Button>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground">
          Bạn cần đăng nhập và mua khóa học để viết đánh giá.
        </p>
      )}

      {/* 3. Form tạo mới */}
      {showForm && (
        <div className="bg-muted/30 p-6 rounded-lg space-y-4 border animate-in fade-in zoom-in-95 duration-200">
          <h4 className="font-semibold">Viết đánh giá của bạn</h4>
          <div className="space-y-2">
            <span className="text-sm font-medium">Chọn số sao:</span>
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
                      star <= rating
                        ? "text-yellow-500"
                        : "text-muted-foreground/30"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Chia sẻ cảm nhận của bạn..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="bg-white"
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
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </div>
      )}

      {/* 4. Đánh giá CỦA TÔI (Hiện/Sửa/Xóa) */}
      {myReview && (
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
          {isEditing ? (
            // --- CHẾ ĐỘ SỬA ---
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-900">Chỉnh sửa đánh giá</h4>
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
                          : "text-muted-foreground/30"
                      }
                    />
                  </button>
                ))}
              </div>
              <Textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={3}
                className="bg-white"
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
            <div>
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-blue-800">
                  Đánh giá của bạn
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                    onClick={handleStartEdit}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Avatar className="h-10 w-10 border bg-white">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback>
                    {user?.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-sm">
                      {user?.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {myReview.updatedAt &&
                        formatDistanceToNow(new Date(myReview.updatedAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      {myReview.updatedAt !== myReview.createdAt && " (đã sửa)"}
                    </div>
                  </div>
                  <StarRating rating={myReview.rating} size={14} />
                  <p className="text-sm text-foreground mt-2 leading-relaxed whitespace-pre-wrap">
                    {myReview.comment}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Danh sách Review KHÁC */}
      <div className="space-y-6">
        {reviews
          // .filter((r) => r.id !== myReview?.id) // Lọc bỏ review của mình nếu có trong list chung
          .map((review) => (
            <div
              key={review.id}
              className="flex gap-4 pb-6 border-b last:border-0"
            >
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={review.userAvatarUrl} />
                <AvatarFallback>
                  {review.userName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-sm">
                    {review.userName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {review.createdAt &&
                      formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                  </div>
                </div>
                <StarRating rating={review.rating} size={14} />
                <p className="text-sm text-foreground mt-2 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          ))}
        {reviews.length === 0 && !myReview && (
          <p className="text-muted-foreground text-center py-8 bg-muted/10 rounded-lg border border-dashed">
            Chưa có đánh giá nào.
          </p>
        )}
      </div>

      {/* Dialog Xác nhận Xóa */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đánh giá?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}