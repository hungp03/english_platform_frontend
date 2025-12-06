"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ExternalLink, Loader2, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { getMyReviewsList } from "@/lib/api/review";
import { StarRating } from "@/components/reviews/star-rating";

export default function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
    const [page, setPage] = useState(1);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await getMyReviewsList({ page, size: 10 });
            if (res.success) {
                // Xử lý dữ liệu trả về tùy theo cấu trúc (result/content)
                const data = res.data;
                const list = data?.result || data?.content || [];
                setReviews(list);
                setMeta(data?.meta || { page: 1, pages: 1, total: 0 });
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi tải đánh giá");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page]);

    if (loading && reviews.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Lịch sử đánh giá</h2>
                    <p className="text-sm text-muted-foreground">
                        Quản lý các đánh giá bạn đã gửi cho các khóa học
                    </p>
                </div>
                <Link href="/account">
                    <Button variant="outline">
                        Quay lại tài khoản
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {reviews.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg">Chưa có đánh giá nào</h3>
                            <p className="text-muted-foreground mt-1 mb-4">
                                Bạn chưa viết đánh giá cho khóa học nào.
                            </p>
                            <Link href="/my-courses/learning">
                                <Button>Vào học ngay</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    reviews.map((review) => (
                        <Card key={review.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Cột trái: Thông tin khóa học */}
                                    <div className="w-full md:w-64 bg-muted/10 p-4 flex flex-col gap-3 border-b md:border-b-0 md:border-r">
                                        <div className="aspect-video relative rounded-md overflow-hidden bg-muted border">
                                            <Image
                                                src={review.courseThumbnail || "/course-placeholder.jpeg"}
                                                alt={review.courseTitle}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm line-clamp-2 mb-1" title={review.courseTitle}>
                                                {review.courseTitle}
                                            </h4>

                                            {/* NÚT REDIRECT QUA KHÓA HỌC */}
                                            {review.courseSlug ? (
                                                <Link href={`/courses/${review.courseSlug}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                                                    Xem khóa học <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Khóa học không khả dụng</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cột phải: Nội dung đánh giá */}
                                    <div className="flex-1 p-4 md:p-6 flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-yellow-50 px-2 py-1 rounded border border-yellow-100 flex items-center">
                                                    <StarRating rating={review.rating} size={16} />
                                                    <span className="ml-2 font-bold text-yellow-700">{review.rating}.0</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    • {review.createdAt && formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
                                                </span>
                                            </div>

                                            {!review.isPublished && (
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                                                    Đã ẩn
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                {review.comment || <span className="italic text-muted-foreground">Không có nội dung nhận xét.</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {meta.pages > 1 && (
                <div className="flex justify-center pt-4">
                    <Pagination
                        currentPage={page}
                        totalPages={meta.pages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}