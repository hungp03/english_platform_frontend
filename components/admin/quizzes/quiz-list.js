"use client";

import { memo, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardCheck, FolderOpen } from "lucide-react";
import QuizActionsMenu from "./quiz-actions-menu";

const STATUS_MAP = {
  DRAFT: { label: "Bản nháp", variant: "secondary" },
  PUBLISHED: { label: "Đã xuất bản", variant: "default" },
  ARCHIVED: { label: "Đã lưu trữ", variant: "outline" },
};

const QuizItem = memo(({ quiz, onDelete, onStatusChange }) => {
  const t = quiz.quizTypeName || quiz.quizType?.name || quiz.quizTypeCode || "";
  const sec = quiz.quizSectionName || quiz.quizSection?.name || "";
  const sk = quiz.skill || quiz.quizSection?.skill || "";
  const statusInfo = STATUS_MAP[quiz.status] || { label: quiz.status, variant: "secondary" };

  const handleDelete = useCallback(() => onDelete(quiz), [quiz, onDelete]);
  const handleStatusChange = useCallback((v) => onStatusChange(quiz.id, v), [quiz.id, onStatusChange]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <ClipboardCheck className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm sm:text-base truncate">
            {quiz.title || quiz.name || quiz.id}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {t && <Badge variant="outline" className="text-xs">{t}</Badge>}
            {sk && <Badge variant="secondary" className="text-xs">{sk}</Badge>}
            {sec && <span className="text-xs text-muted-foreground">{sec}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:flex-shrink-0">
        <Select value={quiz.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Bản nháp</SelectItem>
            <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
            <SelectItem value="ARCHIVED">Đã lưu trữ</SelectItem>
          </SelectContent>
        </Select>
        <QuizActionsMenu quizId={quiz.id} onDelete={handleDelete} />
      </div>
    </div>
  );
});

QuizItem.displayName = "QuizItem";

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-48 sm:w-64 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-[130px]" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <FolderOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Không có đề thi</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Không tìm thấy đề thi nào phù hợp với bộ lọc hiện tại
      </p>
    </div>
  );
}

export default function QuizList({ items, loading, onDelete, onStatusChange }) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!items || items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {items.map((q) => (
        <QuizItem
          key={q.id}
          quiz={q}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
