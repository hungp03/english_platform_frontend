"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  ArrowLeft,
  ClipboardCheck,
  Plus,
  Image,
  FileText,
  HelpCircle,
  Pencil,
  Trash2,
  CheckCircle,
  Inbox,
  RotateCcw,
  Save,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getQuiz, updateQuiz } from "@/lib/api/quiz/quiz";
import { listQuestionsByQuiz, deleteQuestion, createQuestion, updateQuestion } from "@/lib/api/quiz/question";
import QuestionForm from "@/components/admin/questions/question-form";
import ContextEditor from "@/components/admin/questions/context-editor";

const MediaManager = dynamic(() => import("@/components/media/media-manager"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-8">
      <Skeleton className="h-32 w-full" />
    </div>
  ),
});

const PageHeader = memo(function PageHeader({ quiz, questionsCount, onAddNew }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight line-clamp-1">
              {quiz?.title || "Quản lý câu hỏi"}
            </h1>
            <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
              {quiz?.skill && (
                <Badge variant="secondary" className="text-xs">
                  {quiz.skill}
                </Badge>
              )}
              <span>{questionsCount} câu hỏi</span>
            </div>
          </div>
        </div>
      </div>
      <Button onClick={onAddNew} className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        Thêm câu hỏi
      </Button>
    </div>
  );
});

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
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

const QuestionItem = memo(function QuestionItem({ question, index, onEdit, onDelete }) {
  return (
    <div className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Câu {question.orderIndex ?? index + 1}
          </Badge>
          {question.type && (
            <Badge variant="secondary" className="text-xs capitalize">
              {question.type}
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(question)} className="h-7 w-7 p-0">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(question)}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {question.content ? (
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-sm border-l-2 border-muted-foreground/20 pl-3"
          dangerouslySetInnerHTML={{ __html: question.content }}
        />
      ) : (
        <p className="text-sm text-muted-foreground italic">Không có nội dung</p>
      )}

      {question.options?.length > 0 && (
        <div className="mt-3 pt-3 border-t space-y-1.5">
          {question.options
            .sort((a, b) => (a.orderIndex || 1) - (b.orderIndex || 1))
            .map((opt, i) => (
              <div
                key={opt.id || i}
                className={`flex items-start gap-2 p-2 rounded text-sm ${
                  opt.correct
                    ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                    : "bg-muted/50"
                }`}
              >
                <span className={`font-medium ${opt.correct ? "text-green-600" : "text-muted-foreground"}`}>
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="flex-1">{opt.content}</span>
                {opt.correct && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
              </div>
            ))}
        </div>
      )}
    </div>
  );
});

function QuestionsList({ questions, loading, error, page, totalPages, onPageChange, onEdit, onDelete, onAddNew }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!questions?.length) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">Chưa có câu hỏi</h3>
        <p className="text-sm text-muted-foreground mb-4">Bắt đầu thêm câu hỏi cho đề thi này</p>
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo câu hỏi đầu tiên
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((q, idx) => (
        <QuestionItem key={q.id || idx} question={q} index={idx} onEdit={onEdit} onDelete={onDelete} />
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function QuizQuestionsPage() {
  const params = useParams();
  const quizId = params?.id || "unknown";
  const folderPath = `quiz/${quizId}/media`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [quiz, setQuiz] = useState(null);
  const [contextText, setContextText] = useState("");
  const [explanation, setExplanation] = useState("");

  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);

  const maxOrderIndex = useMemo(() => {
    if (!questions?.length) return 0;
    return Math.max(...questions.map((q) => q.orderIndex ?? 1));
  }, [questions]);

  const loadAll = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      setError(null);

      const [quizRes, questionsRes] = await Promise.all([
        getQuiz(quizId),
        listQuestionsByQuiz(quizId, { page: p, pageSize: 20 }),
      ]);

      const qd = quizRes?.data || quizRes;
      setQuiz(qd);
      setContextText(qd?.contextText || "");
      setExplanation(qd?.explanation || "");

      const data = questionsRes?.data || questionsRes;
      setQuestions(data?.result || data?.items || []);
      setTotalPages(data?.meta?.pages || data?.totalPages || 1);
      setPage(data?.meta?.page || p);
    } catch (e) {
      setError(e?.message || "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) loadAll(1);
  }, [quizId, loadAll]);

  const saveQuizContent = useCallback(async () => {
    try {
      setSaving(true);
      await updateQuiz(quizId, { contextText, explanation });
      toast.success("Đã lưu nội dung");
    } catch (e) {
      toast.error(e?.message || "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  }, [quizId, contextText, explanation]);

  const openDeleteDialog = useCallback((question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteQuestion = useCallback(async () => {
    if (!questionToDelete) return;
    const prev = [...questions];

    setQuestions((qs) => qs.filter((q) => q.id !== questionToDelete.id));
    setDeleteDialogOpen(false);
    const deleted = questionToDelete;
    setQuestionToDelete(null);

    try {
      await deleteQuestion(deleted.id);
      toast.success("Đã xóa câu hỏi");
    } catch (e) {
      setQuestions(prev);
      toast.error(e?.message || "Không xóa được");
    }
  }, [questionToDelete, questions]);

  const openAddDialog = useCallback(() => setAddDialogOpen(true), []);

  const handleAddQuestion = useCallback(async (data) => {
    try {
      if (questions.find((q) => q.orderIndex === Number(data.orderIndex))) {
        toast.error(`Thứ tự ${data.orderIndex} đã được sử dụng`);
        return;
      }

      const payload = {
        quizId: data.quizId,
        content: data.content,
        explanation: data.explanation || "",
        orderIndex: Number(data.orderIndex),
      };

      const validOpts = data.options?.filter((o) => o.content?.trim());
      if (validOpts?.length) {
        payload.options = validOpts.map((o, i) => ({
          content: o.content,
          correct: !!o.correct,
          orderIndex: Number(o.orderIndex || i + 1),
        }));
      }

      const tempId = `temp-${Date.now()}`;
      setQuestions((qs) => [...qs, { ...payload, id: tempId }]);
      setAddDialogOpen(false);

      const result = await createQuestion(payload);
      const newQ = result?.data || result;
      setQuestions((qs) => qs.map((q) => (q.id === tempId ? newQ : q)));
      toast.success("Đã tạo câu hỏi");
    } catch (e) {
      setQuestions((qs) => qs.filter((q) => !q.id.toString().startsWith("temp-")));
      toast.error(e?.message || "Không thể tạo");
    }
  }, [questions]);

  const openEditDialog = useCallback((question) => {
    setQuestionToEdit(question);
    setEditDialogOpen(true);
  }, []);

  const handleEditQuestion = useCallback(async (data) => {
    if (!questionToEdit) return;
    try {
      if (questions.find((q) => q.orderIndex === Number(data.orderIndex) && q.id !== questionToEdit.id)) {
        toast.error(`Thứ tự ${data.orderIndex} đã được sử dụng`);
        return;
      }

      const payload = {
        quizId: data.quizId,
        content: data.content,
        explanation: data.explanation || "",
        orderIndex: Number(data.orderIndex),
      };

      const validOpts = data.options?.filter((o) => o.content?.trim());
      if (validOpts?.length) {
        payload.options = validOpts.map((o, i) => ({
          content: o.content,
          correct: !!o.correct,
          orderIndex: Number(o.orderIndex || i + 1),
        }));
      }

      const prev = [...questions];
      setQuestions((qs) => qs.map((q) => (q.id === questionToEdit.id ? { ...q, ...payload } : q)));
      setEditDialogOpen(false);
      setQuestionToEdit(null);

      await updateQuestion(questionToEdit.id, payload);
      toast.success("Đã cập nhật câu hỏi");
    } catch (e) {
      loadAll(page);
      toast.error(e?.message || "Không thể cập nhật");
    }
  }, [questionToEdit, questions, loadAll, page]);

  const handlePageChange = useCallback((p) => {
    setPage(p);
    loadAll(p);
  }, [loadAll]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState error={error} onRetry={() => loadAll(1)} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader quiz={quiz} questionsCount={questions?.length || 0} onAddNew={openAddDialog} />

      {/* Media Manager */}
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Context & Explanation */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Ngữ cảnh / Bài đọc
              </CardTitle>
              <CardDescription>Nội dung đoạn văn hoặc audio cho các câu hỏi</CardDescription>
            </CardHeader>
            <CardContent>
              <ContextEditor
                contextText={contextText}
                onContextChange={setContextText}
                onSave={saveQuizContent}
                saving={saving}
                loading={loading}
                folderPath={folderPath}
              />
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
            <CardContent className="space-y-4">
              <Textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={6}
                placeholder="Nhập giải thích chi tiết cho toàn bộ quiz..."
                className="resize-none"
              />
              <Button onClick={saveQuizContent} disabled={saving} variant="secondary" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Đang lưu..." : "Lưu giải thích"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Questions */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="h-4 w-4" />
                Danh sách câu hỏi
              </CardTitle>
              <Badge variant="secondary">{questions?.length || 0}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <QuestionsList
              questions={questions}
              loading={false}
              error={null}
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onAddNew={openAddDialog}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa câu hỏi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa câu hỏi <strong>#{questionToDelete?.orderIndex}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm câu hỏi mới</DialogTitle>
          </DialogHeader>
          <QuestionForm
            quizId={quizId}
            quizSkill={quiz?.skill || ""}
            orderIndex={maxOrderIndex + 1}
            onSubmit={handleAddQuestion}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setQuestionToEdit(null);
        }}
      >
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa câu hỏi #{questionToEdit?.orderIndex}</DialogTitle>
          </DialogHeader>
          {questionToEdit && (
            <QuestionForm
              key={questionToEdit.id}
              quizId={quizId}
              quizSkill={quiz?.skill || ""}
              orderIndex={questionToEdit.orderIndex}
              initialData={questionToEdit}
              isEditing={true}
              onSubmit={handleEditQuestion}
              onCancel={() => {
                setEditDialogOpen(false);
                setQuestionToEdit(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
