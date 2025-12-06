"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  DollarSign,
  Globe,
  Layers,
  Plus,
  RotateCcw,
  AlertCircle,
  Inbox,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, cn } from "@/lib/utils";

import ModuleCard from "@/components/instructor/courses/course-detail/module-card";
import ModuleCreateDialog from "@/components/instructor/courses/course-detail/module-create-dialog";
import ModuleEditDialog from "@/components/instructor/courses/course-detail/module-edit-dialog";
import ModuleDeleteDialog from "@/components/instructor/courses/course-detail/module-delete-dialog";

import { getCourseById } from "@/lib/api/course";
import { getCourseModules, deleteCourseModule } from "@/lib/api/course-module";

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
    label: "Chờ duyệt",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    icon: Clock,
  },
};

function PageHeader({ title }) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/instructor/courses">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Chi tiết khóa học</h1>
          {title && (
            <p className="text-sm text-muted-foreground hidden sm:block line-clamp-1">
              {title}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="aspect-video rounded-lg" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 pt-4">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Không tìm thấy khóa học</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          Khóa học không tồn tại hoặc bạn không có quyền truy cập
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/instructor/courses">Quay lại</Link>
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

  const priceDisplay = course.priceCents
    ? formatCurrency(course.priceCents, course.currency)
    : "Miễn phí";

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

            <div className="flex flex-wrap gap-2 mb-4">
              {Array.isArray(course.skillFocus) &&
                course.skillFocus.map((skill) => (
                  <Badge key={skill} variant="secondary" className="capitalize">
                    {skill}
                  </Badge>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-green-600">{priceDisplay}</span>
              </div>
              {course.language && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{course.language}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span>{course.moduleCount ?? 0} module</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{course.lessonCount ?? 0} bài học</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ModulesEmptyState({ onCreateNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/30">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">Chưa có module nào</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        Bắt đầu thêm module để tổ chức nội dung khóa học
      </p>
      <Button onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Tạo module đầu tiên
      </Button>
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId;

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const [courseData, moduleData] = await Promise.all([
        getCourseById(courseId),
        getCourseModules(courseId),
      ]);
      setCourse(courseData.data);
      setModules(moduleData || []);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error("Không thể tải dữ liệu khóa học");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) fetchData();
  }, [courseId, fetchData]);

  const handleCreateModule = useCallback((newModuleData) => {
    setModules((prev) => {
      const updated = [
        ...prev,
        {
          id: newModuleData.id,
          title: newModuleData.title,
          position: newModuleData.position,
          lessonCount: newModuleData.lessonCount ?? 0,
        },
      ];
      return updated.sort((a, b) => a.position - b.position);
    });

    setCourse((prev) => ({
      ...prev,
      moduleCount: (prev?.moduleCount ?? 0) + 1,
    }));

    toast.success(`Đã tạo module "${newModuleData.title}"`);
  }, []);

  const handleEdit = useCallback((module) => {
    setSelectedModule(module);
    setEditDialogOpen(true);
  }, []);

  const handleUpdateModule = useCallback((updated) => {
    setModules((prev) => {
      const newList = prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m));
      return newList.sort((a, b) => a.position - b.position);
    });
    toast.success(`Đã cập nhật module "${updated.title}"`);
  }, []);

  const handleDelete = useCallback((module) => {
    setSelectedModule(module);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedModule) return;
    const { success, error } = await deleteCourseModule(courseId, selectedModule.id);

    if (!success) {
      toast.error(error || `Không thể xóa module "${selectedModule.title}"`);
      setDeleteDialogOpen(false);
      return;
    }

    setModules((prev) => prev.filter((m) => m.id !== selectedModule.id));
    setCourse((prev) => ({
      ...prev,
      moduleCount: Math.max((prev?.moduleCount ?? 1) - 1, 0),
    }));
    toast.success(`Đã xóa module "${selectedModule?.title}"`);
    setDeleteDialogOpen(false);
  }, [courseId, selectedModule]);

  const handleOpenCreateDialog = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-full bg-background">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-4 sm:p-6 space-y-6 min-h-full bg-background">
        <PageHeader />
        <ErrorState onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
      <PageHeader title={course.title} />

      <CourseHero course={course} />

      {course.detailedDescription && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Mô tả chi tiết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: course.detailedDescription }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4" />
                Danh sách Module
              </CardTitle>
              <CardDescription>{modules.length} module</CardDescription>
            </div>
            <ModuleCreateDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              courseId={courseId}
              onCreateSuccess={handleCreateModule}
            />
          </div>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <ModulesEmptyState onCreateNew={handleOpenCreateDialog} />
          ) : (
            <div className="space-y-3">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  courseId={courseId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ModuleEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        module={selectedModule}
        courseId={courseId}
        onUpdateSuccess={handleUpdateModule}
      />

      <ModuleDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        module={selectedModule}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
