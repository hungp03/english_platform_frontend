"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  User,
  Calendar,
  DollarSign,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getCourseBySlug } from "@/lib/api/course";
import { formatCurrency, cn } from "@/lib/utils";
import { AdminCourseModules } from "@/components/admin/courses/detail";

const STATUS_CONFIG = {
  PUBLISHED: {
    label: "Đã xuất bản",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    icon: CheckCircle,
  },
  DRAFT: {
    label: "Bản nháp",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    icon: FileText,
  },
  PENDING_REVIEW: {
    label: "Chờ phê duyệt",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    icon: Clock,
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: XCircle,
  },
  UNPUBLISHED: {
    label: "Tạm ẩn",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    icon: Eye,
  },
};

function PageHeader({ course }) {
  const statusConfig = STATUS_CONFIG[course?.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/admin/courses">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight line-clamp-1">
              Chi tiết khóa học
            </h1>
            <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 hidden sm:block">
            {course?.title}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="aspect-video rounded-lg" />
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Không thể tải khóa học</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          {error || "Khóa học không tồn tại hoặc bạn không có quyền truy cập"}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/courses">Quay lại</Link>
          </Button>
          <Button onClick={onRetry}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseHero({ course }) {
  const statusConfig = STATUS_CONFIG[course.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = statusConfig.icon;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            <Image
              src={course.thumbnail || "/course-placeholder.jpeg"}
              alt={course.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="lg:col-span-2 flex flex-col">
            <div className="flex items-start gap-3 mb-3">
              <h2 className="text-xl sm:text-2xl font-bold flex-1">{course.title}</h2>
              <Badge variant="outline" className={cn("text-xs flex-shrink-0", statusConfig.color)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>

            <p className="text-muted-foreground mb-4 line-clamp-3">{course.description}</p>

            {course.skillFocus?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {course.skillFocus.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="capitalize">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-auto pt-4 border-t flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span>{course.moduleCount || 0} chương</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{course.lessonCount || 0} bài học</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>{formatCurrency(course.priceCents, course.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseInfo({ course }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const infoItems = [
    { icon: BookOpen, label: "Số chương", value: course.moduleCount || 0 },
    { icon: FileText, label: "Số bài học", value: course.lessonCount || 0 },
    { icon: DollarSign, label: "Giá khóa học", value: formatCurrency(course.priceCents, course.currency) },
    { icon: User, label: "Giảng viên", value: course.createdBy || "Chưa cập nhật" },
    { icon: Calendar, label: "Cập nhật", value: formatDate(course.updatedAt) },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4" />
          Thông tin khóa học
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-semibold text-sm truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CourseDescription({ course }) {
  if (!course.longDescription) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Mô tả chi tiết
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: course.longDescription }}
        />
      </CardContent>
    </Card>
  );
}

export default function AdminCourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getCourseBySlug(params.slug);

    if (result.success) {
      setCourse(result.data);
    } else {
      setError(result.error || "Không thể tải thông tin khóa học");
    }

    setLoading(false);
  }, [params.slug]);

  useEffect(() => {
    if (params.slug) {
      fetchCourse();
    }
  }, [params.slug, fetchCourse]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/courses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Chi tiết khóa học</h1>
        </div>
        <ErrorState error={error} onRetry={fetchCourse} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader course={course} />
      <CourseHero course={course} />
      <CourseInfo course={course} />
      <CourseDescription course={course} />
      <AdminCourseModules courseId={course.id} />
    </div>
  );
}
