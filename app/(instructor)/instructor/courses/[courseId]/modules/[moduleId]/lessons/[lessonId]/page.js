"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Video,
  HelpCircle,
  Clock,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import LessonHeader from "@/components/instructor/courses/lesson-detail/lesson-header";
import LessonTabs from "@/components/instructor/courses/lesson-detail/lesson-tabs";
import LessonContentDialog from "@/components/instructor/courses/lesson-detail/lesson-content-dialog";

import { getLessonDetail, updateLesson } from "@/lib/api/lesson";

const KIND_CONFIG = {
  video: {
    label: "Video",
    icon: Video,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  article: {
    label: "Bài đọc",
    icon: FileText,
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  html: {
    label: "Bài đọc",
    icon: FileText,
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  quiz: {
    label: "Bài kiểm tra",
    icon: HelpCircle,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

const STATUS_CONFIG = {
  published: {
    label: "Đã xuất bản",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle,
  },
  draft: {
    label: "Chưa xuất bản",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    icon: Clock,
  },
};

function PageHeader({ courseId, moduleId, lessonTitle }) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/instructor/courses/${courseId}/modules/${moduleId}`}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Chi tiết bài học</h1>
          {lessonTitle && (
            <p className="text-sm text-muted-foreground hidden sm:block line-clamp-1">
              {lessonTitle}
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
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="aspect-video w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ courseId, moduleId, onRetry }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Không tìm thấy bài học</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          Bài học không tồn tại hoặc bạn không có quyền truy cập
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/instructor/courses/${courseId}/modules/${moduleId}`}>Quay lại</Link>
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

function LessonInfo({ lesson }) {
  const kindKey = lesson.kind?.toLowerCase() || "article";
  const kindConfig = KIND_CONFIG[kindKey] || KIND_CONFIG.article;
  const KindIcon = kindConfig.icon;
  const statusConfig = lesson.published ? STATUS_CONFIG.published : STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg sm:text-xl flex-shrink-0">
            {lesson.position || 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className={cn("text-xs", kindConfig.color)}>
                <KindIcon className="h-3 w-3 mr-1" />
                {kindConfig.label}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {lesson.isFree && (
                <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Gift className="h-3 w-3 mr-1" />
                  Miễn phí
                </Badge>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-2">{lesson.title}</h2>

            {lesson.estimatedMin && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{lesson.estimatedMin} phút</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuizContent({ lesson }) {
  const questions = lesson.content?.body?.questions || [];
  const quizContent = lesson.content?.body?.quizzes_content;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <HelpCircle className="h-4 w-4" />
          Nội dung Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {quizContent && (
          <div className="p-4 rounded-lg bg-muted/30 border">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: quizContent }}
            />
          </div>
        )}

        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                <p className="font-medium mb-3">
                  Câu {idx + 1}: {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={cn(
                        "px-3 py-2 rounded text-sm",
                        i === q.answer
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-800 font-medium"
                          : "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {opt}
                      {i === q.answer && (
                        <CheckCircle className="inline-block h-4 w-4 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Chưa có câu hỏi nào
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { courseId, moduleId, lessonId } = params;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editContentDialogOpen, setEditContentDialogOpen] = useState(false);

  const equalsIgnoreCase = (a, b) => {
    return (
      typeof a === "string" &&
      typeof b === "string" &&
      a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0
    );
  };

  const fetchLesson = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getLessonDetail(moduleId, lessonId);
      if (res.success) {
        setLesson(res.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error("Không thể tải chi tiết bài học");
    } finally {
      setLoading(false);
    }
  }, [moduleId, lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const handleVideoUploaded = useCallback(
    async (mediaId) => {
      try {
        const payload = {
          title: lesson.title,
          kind: lesson.kind,
          estimatedMin: lesson.estimatedMin,
          position: lesson.position,
          isFree: lesson.isFree,
          content: lesson.content,
          mediaId: mediaId,
        };

        const updateResult = await updateLesson(moduleId, lessonId, payload);

        if (!updateResult.success) {
          toast.error(updateResult.error || "Không thể cập nhật video cho bài học");
          return;
        }

        const res = await getLessonDetail(moduleId, lessonId);
        if (res.success) {
          setLesson(res.data);
          toast.success("Video đã được cập nhật cho bài học");
        }
      } catch (err) {
        console.error("Error updating lesson with media:", err);
        toast.error("Đã xảy ra lỗi khi cập nhật bài học");
      }
    },
    [lesson, moduleId, lessonId]
  );

  const handleOpenEditContent = useCallback(() => {
    setEditContentDialogOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-full bg-background">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="p-4 sm:p-6 space-y-6 min-h-full bg-background">
        <PageHeader courseId={courseId} moduleId={moduleId} />
        <ErrorState courseId={courseId} moduleId={moduleId} onRetry={fetchLesson} />
      </div>
    );
  }

  const isQuizLesson = equalsIgnoreCase(lesson.kind, "quiz");

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
      <PageHeader courseId={courseId} moduleId={moduleId} lessonTitle={lesson.title} />

      <LessonHeader lesson={lesson} />

      {isQuizLesson ? (
        <QuizContent lesson={lesson} />
      ) : (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <LessonTabs
              lesson={lesson}
              onEditContent={handleOpenEditContent}
              onVideoUploaded={handleVideoUploaded}
            />
          </CardContent>
        </Card>
      )}

      <LessonContentDialog
        open={editContentDialogOpen}
        onOpenChange={setEditContentDialogOpen}
        lesson={lesson}
        onUpdated={setLesson}
      />
    </div>
  );
}
