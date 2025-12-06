"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Layers,
  Plus,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  RotateCcw,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import LessonCard from "@/components/instructor/courses/module-detail/lesson-card";
import LessonDeleteDialog from "@/components/instructor/courses/module-detail/lesson-delete-dialog";
import ModulePublishDialog from "@/components/instructor/courses/module-detail/module-publish-dialog";
import { listCourseLessons } from "@/lib/api/lesson";
import { getCourseModuleDetail, publishModule } from "@/lib/api/course-module";

const STATUS_CONFIG = {
  published: {
    label: "Đã xuất bản",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    icon: CheckCircle,
  },
  draft: {
    label: "Chưa xuất bản",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    icon: Clock,
  },
};

function PageHeader({ courseId, moduleTitle }) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/instructor/courses/${courseId}`}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Chi tiết Module</h1>
          {moduleTitle && (
            <p className="text-sm text-muted-foreground hidden sm:block line-clamp-1">
              {moduleTitle}
            </p>
          )}
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
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full max-w-md" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ courseId, onRetry }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Không tìm thấy module</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          Module không tồn tại hoặc bạn không có quyền truy cập
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/instructor/courses/${courseId}`}>Quay lại</Link>
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

function ModuleInfo({ module, isPublished, isUpdating, onPublishClick }) {
  const statusConfig = isPublished ? STATUS_CONFIG.published : STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl sm:text-2xl flex-shrink-0">
            {module.position || 1}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-1">{module.title}</h2>
            {module.description && (
              <p className="text-muted-foreground text-sm mb-3">{module.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                {module.lessonCount ?? 0} bài học
              </Badge>
              <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          <Button
            onClick={onPublishClick}
            disabled={isUpdating}
            variant={isPublished ? "outline" : "default"}
            className="w-full sm:w-auto"
          >
            {isPublished ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Hủy xuất bản
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Xuất bản
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LessonsEmptyState({ courseId, moduleId }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/30">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">Chưa có bài học nào</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        Bắt đầu thêm bài học để xây dựng nội dung module
      </p>
      <Button asChild>
        <Link href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/new`}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo bài học đầu tiên
        </Link>
      </Button>
    </div>
  );
}

export default function ModuleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { courseId, moduleId } = params;

  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [pendingPublishState, setPendingPublishState] = useState(false);

  const fetchData = useCallback(async () => {
    if (!courseId || !moduleId) return;
    setLoading(true);
    setError(false);
    try {
      const [modRes, lessonRes] = await Promise.all([
        getCourseModuleDetail(courseId, moduleId),
        listCourseLessons(moduleId),
      ]);

      if (modRes.success) {
        setModule(modRes.data);
        setIsPublished(modRes.data.published || false);
      } else {
        setError(true);
        toast.error(modRes.error || "Không thể tải thông tin module");
      }

      if (lessonRes.success) {
        setLessons(lessonRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error("Không thể tải dữ liệu module");
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback(
    (lesson) => {
      router.push(
        `/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/edit`
      );
    },
    [router, courseId, moduleId]
  );

  const handleDelete = useCallback((lesson) => {
    setSelectedLesson(lesson);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (selectedLesson) {
      setLessons((prev) => prev.filter((l) => l.id !== selectedLesson.id));
      toast.success(`Đã xóa bài học "${selectedLesson.title}"`);
    }
    setDeleteDialogOpen(false);
  }, [selectedLesson]);

  const handlePublishClick = useCallback(() => {
    setPendingPublishState(!isPublished);
    setShowPublishDialog(true);
  }, [isPublished]);

  const handlePublishConfirm = useCallback(async () => {
    setIsPublished(pendingPublishState);
    setIsUpdating(true);
    setShowPublishDialog(false);

    const result = await publishModule(courseId, moduleId, pendingPublishState);

    setIsUpdating(false);

    if (result.success) {
      toast.success(
        pendingPublishState ? "Module đã được xuất bản" : "Đã hủy xuất bản module"
      );
    } else {
      setIsPublished(!pendingPublishState);
      toast.error(result.error || "Không thể cập nhật trạng thái xuất bản");
    }
  }, [courseId, moduleId, pendingPublishState]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-full bg-background">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="p-4 sm:p-6 space-y-6 min-h-full bg-background">
        <PageHeader courseId={courseId} />
        <ErrorState courseId={courseId} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
      <PageHeader courseId={courseId} moduleTitle={module.title} />

      <ModuleInfo
        module={module}
        isPublished={isPublished}
        isUpdating={isUpdating}
        onPublishClick={handlePublishClick}
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Danh sách bài học
              </CardTitle>
              <CardDescription>{lessons.length} bài học</CardDescription>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm bài học
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <LessonsEmptyState courseId={courseId} moduleId={moduleId} />
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  courseId={courseId}
                  moduleId={moduleId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LessonDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        lesson={selectedLesson}
        onConfirm={confirmDelete}
      />

      <ModulePublishDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        module={module}
        isPublishing={pendingPublishState}
        onConfirm={handlePublishConfirm}
      />
    </div>
  );
}
