"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  ArrowLeft,
  ClipboardCheck,
  Save,
  Image,
  FileText,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Layers,
  Target,
  ToggleLeft,
  ListOrdered,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { listQuizTypes } from "@/lib/api/quiz/quiz-type";
import { getQuiz, updateQuizWithSection, createQuizWithSection } from "@/lib/api/quiz/quiz";
import { pageQuizSectionsByType } from "@/lib/api/quiz/quiz-section";
import { quizCreateSchema } from "@/schema/quiz";
import ContextEditor from "@/components/admin/questions/context-editor";

const MediaManager = dynamic(() => import("@/components/media/media-manager"), {
  ssr: false,
  loading: () => <Skeleton className="h-32 w-full" />,
});

const SKILLS = [
  { value: "LISTENING", label: "Listening" },
  { value: "READING", label: "Reading" },
  { value: "SPEAKING", label: "Speaking" },
  { value: "WRITING", label: "Writing" },
];

const STATUSES = [
  { value: "DRAFT", label: "Bản nháp", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { value: "PUBLISHED", label: "Đã xuất bản", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  { value: "ARCHIVED", label: "Đã lưu trữ", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
];

function PageHeader({ isNew, title, status }) {
  const statusConfig = STATUSES.find((s) => s.value === status);

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/admin/quizzes">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <ClipboardCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isNew ? "Tạo đề thi mới" : "Chỉnh sửa đề thi"}
            </h1>
            {!isNew && statusConfig && (
              <Badge variant="outline" className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
            )}
          </div>
          {!isNew && title && (
            <p className="text-sm text-muted-foreground line-clamp-1">{title}</p>
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
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
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
        <h3 className="text-lg font-semibold mb-1">Không thể tải dữ liệu</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/quizzes">Quay lại</Link>
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

function FormField({ label, required, error, children, icon: Icon }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export default function AdminQuizEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const isNew = id === "new";

  const folderPath = useMemo(() => (isNew ? null : `quiz/${id}/media`), [id, isNew]);

  const [types, setTypes] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(quizCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      quizTypeId: "none",
      skill: "READING",
      status: "DRAFT",
      contextText: "",
      quizSectionId: null,
    },
  });

  const watchQuizTypeId = watch("quizTypeId");
  const watchSkill = watch("skill");
  const watchQuizSectionId = watch("quizSectionId");
  const watchTitle = watch("title");
  const watchStatus = watch("status");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const typesRes = await listQuizTypes();
      const typesList = typesRes?.data?.result || typesRes?.data || typesRes || [];
      setTypes(Array.isArray(typesList) ? typesList : []);

      if (!isNew) {
        const quizRes = await getQuiz(id);
        const d = quizRes?.data || quizRes;
        reset({
          title: d.title || "",
          description: d.description || "",
          quizTypeId: d.quizTypeId ? String(d.quizTypeId) : "none",
          skill: d.skill || "READING",
          status: d.status || "DRAFT",
          contextText: d.contextText || "",
          quizSectionId: d.quizSectionId ? String(d.quizSectionId) : null,
        });
      }
    } catch (e) {
      setError(e?.message || "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [id, isNew, reset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const typeId = watchQuizTypeId;
    if (!typeId || typeId === "none") {
      setSections([]);
      setValue("quizSectionId", null);
      return;
    }
    (async () => {
      try {
        const data = await pageQuizSectionsByType(String(typeId), { page: 1, pageSize: 200 });
        const items = data?.result || data?.data?.result || data?.data || data || [];
        const list = Array.isArray(items) ? items : [];
        setSections(list);

        if (watchQuizSectionId && !list.find((s) => String(s.id) === String(watchQuizSectionId))) {
          setValue("quizSectionId", null);
        }
      } catch {
        setSections([]);
        setValue("quizSectionId", null);
      }
    })();
  }, [watchQuizTypeId, setValue, watchQuizSectionId]);

  useEffect(() => {
    if (!sections.length) return;
    const filtered = sections.filter((s) => {
      const sk = String(s.skill || s.quizSkill || "").toUpperCase();
      return !watchSkill || sk === String(watchSkill).toUpperCase();
    });
    if (watchQuizSectionId && !filtered.find((s) => String(s.id) === String(watchQuizSectionId))) {
      setValue("quizSectionId", null);
    }
  }, [watchSkill, sections, watchQuizSectionId, setValue]);

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      const sk = String(s.skill || s.quizSkill || "").toUpperCase();
      return !watchSkill || sk === String(watchSkill).toUpperCase();
    });
  }, [sections, watchSkill]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description || "",
        quizTypeId: data.quizTypeId,
        skill: data.skill,
        status: data.status,
        contextText: data.contextText || "",
      };
      if (data.quizSectionId) payload.quizSectionId = data.quizSectionId;

      if (isNew) {
        await createQuizWithSection(payload);
        toast.success("Đã tạo đề thi mới");
      } else {
        await updateQuizWithSection(id, payload);
        toast.success("Đã cập nhật đề thi");
      }
      router.push("/admin/quizzes");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lưu thất bại");
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState error={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader isNew={isNew} title={watchTitle} status={watchStatus} />

      {isNew && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Vui lòng tạo đề thi trước, sau đó bạn có thể tải lên hình ảnh và media.
          </AlertDescription>
        </Alert>
      )}

      {!isNew && folderPath && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Image className="h-4 w-4" />
              Quản lý Media
            </CardTitle>
            <CardDescription>Upload và quản lý hình ảnh, audio cho đề thi</CardDescription>
          </CardHeader>
          <CardContent>
            <MediaManager folder={folderPath} />
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Tiêu đề" required error={errors.title?.message} icon={FileText}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Nhập tiêu đề đề thi" />}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Loại đề" required error={errors.quizTypeId?.message} icon={Layers}>
                <Controller
                  name="quizTypeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        setValue("quizSectionId", null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại đề" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Chọn loại đề --</SelectItem>
                        {types.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.name || t.code || t.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Kỹ năng" required error={errors.skill?.message} icon={Target}>
                <Controller
                  name="skill"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn kỹ năng" />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILLS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField
                label="Section"
                error={errors.quizSectionId?.message}
                icon={ListOrdered}
              >
                <Controller
                  name="quizSectionId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                      disabled={watchQuizTypeId === "none" || !filteredSections.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-- Không chọn --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Không chọn --</SelectItem>
                        {filteredSections.map((s) => (
                          <SelectItem key={String(s.id)} value={String(s.id)}>
                            {s.name || s.id}
                            {(s.skill || s.quizSkill) && ` • ${s.skill || s.quizSkill}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Trạng thái" required error={errors.status?.message} icon={ToggleLeft}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            <FormField label="Mô tả" error={errors.description?.message}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} rows={3} placeholder="Nhập mô tả đề thi" className="resize-none" />
                )}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Ngữ cảnh / Bài đọc
            </CardTitle>
            <CardDescription>Nội dung đoạn văn hoặc audio cho các câu hỏi</CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="contextText"
              control={control}
              render={({ field }) => (
                <ContextEditor
                  contextText={field.value}
                  onContextChange={field.onChange}
                  folderPath={folderPath}
                  saving={isSubmitting}
                />
              )}
            />
            {errors.contextText && (
              <p className="text-sm text-destructive mt-2">{errors.contextText.message}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-4 w-4" />
              Giải thích chi tiết
            </CardTitle>
            <CardDescription>Hiển thị sau khi học viên nộp bài</CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="explanation"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Nhập giải thích hoặc đáp án mẫu"
                  className="resize-none"
                />
              )}
            />
            {errors.explanation && (
              <p className="text-sm text-destructive mt-2">{errors.explanation.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/quizzes">Hủy</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Đang lưu..." : isNew ? "Tạo đề thi" : "Cập nhật"}
          </Button>
        </div>
      </form>
    </div>
  );
}
