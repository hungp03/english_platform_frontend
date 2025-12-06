"use client";

import { useEffect, useState, useCallback, memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { searchQuizzes, updateQuiz, deleteQuiz } from "@/lib/api/quiz/quiz";
import { listQuizTypes } from "@/lib/api/quiz/quiz-type";
import { listPublicQuizSectionsByType } from "@/lib/api/quiz/quiz-section";
import QuizFilters from "@/components/admin/quizzes/quiz-filters";
import QuizList from "@/components/admin/quizzes/quiz-list";
import QuizPagination from "@/components/admin/quizzes/quiz-pagination";
import DeleteQuizDialog from "@/components/admin/quizzes/delete-quiz-dialog";
import { ClipboardCheck, Plus } from "lucide-react";

const PageHeader = memo(function PageHeader() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <ClipboardCheck className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Quản lý đề thi</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Tạo và quản lý các đề thi trên hệ thống
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="sm:size-default flex-shrink-0">
        <Link href="/admin/quizzes/new">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Tạo đề thi</span>
        </Link>
      </Button>
    </div>
  );
});

export default function AdminQuizzesPage() {
  // filters
  const [keyword, setKeyword] = useState("");
  const [quizTypeId, setQuizTypeId] = useState("all");
  const [status, setStatus] = useState("all");
  const [skill, setSkill] = useState("all");
  const [quizSectionId, setQuizSectionId] = useState("all");

  // options
  const [types, setTypes] = useState([]);
  const [sections, setSections] = useState([]);

  // results
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchQuizzes({
        page,
        pageSize,
        keyword,
        quizTypeId: quizTypeId && quizTypeId !== "all" ? quizTypeId : null,
        quizSectionId: quizSectionId && quizSectionId !== "all" ? quizSectionId : null,
        status: status && status !== "all" ? status : null,
        skill: skill && skill !== "all" ? skill : null,
      });
      const meta = res?.meta || res?.data?.meta;
      const result = res?.result || res?.data?.result || res?.data || [];
      setItems(result || []);
      if (meta) {
        setTotal(meta.total || 0);
        setTotalPages(Math.ceil(meta.total / pageSize) || 1);
      } else {
        const totalCount = Array.isArray(result) ? result.length : 0;
        setTotal(totalCount);
        setTotalPages(Math.ceil(totalCount / pageSize) || 1);
      }
    } catch {
      toast.error("Không thể tải danh sách đề thi");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, quizTypeId, quizSectionId, status, skill]);

  const handleStatusChange = useCallback(async (id, nextStatus) => {
    const previousItems = items;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );

    try {
      await updateQuiz(id, { status: nextStatus });
      toast.success("Đã cập nhật trạng thái");
    } catch {
      setItems(previousItems);
      toast.error("Cập nhật trạng thái thất bại");
    }
  }, [items]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const r = await listQuizTypes();
        const data = r?.data?.result || r?.result || r?.data || r || [];
        setTypes(Array.isArray(data) ? data : []);
      } catch {
        setTypes([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!quizTypeId || quizTypeId === "all") {
      setSections([]);
      setQuizSectionId("all");
      return;
    }
    (async () => {
      try {
        const resp = await listPublicQuizSectionsByType(String(quizTypeId), {
          page: 1,
          pageSize: 200,
          ...(skill && skill !== "all" ? { skill } : {}),
        });
        const list = resp?.result || resp?.data || resp || [];
        setSections(Array.isArray(list) ? list : []);

        if (
          quizSectionId &&
          quizSectionId !== "all" &&
          !list.find((s) => String(s.id) === String(quizSectionId))
        ) {
          setQuizSectionId("all");
        }
      } catch {
        setSections([]);
      }
    })();
  }, [quizTypeId, skill, quizSectionId]);

  const onChangeSection = useCallback((val) => {
    setQuizSectionId(val || "all");
    if (!val || val === "all") return;
    if (!skill || skill === "all") {
      const sec = sections.find((s) => String(s.id) === String(val));
      if (sec?.skill) setSkill(String(sec.skill));
    }
  }, [sections, skill]);

  const openDeleteDialog = useCallback((quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!quizToDelete) return;

    const previousItems = items;
    setItems((prev) => prev.filter((item) => item.id !== quizToDelete.id));
    setDeleteDialogOpen(false);

    try {
      await deleteQuiz(quizToDelete.id);
      toast.success("Đã xóa đề thi");
      setQuizToDelete(null);
    } catch {
      setItems(previousItems);
      toast.error("Lỗi khi xóa đề thi");
    }
  }, [quizToDelete, items]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault?.();
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader />

      <QuizFilters
        keyword={keyword}
        setKeyword={setKeyword}
        quizTypeId={quizTypeId}
        setQuizTypeId={setQuizTypeId}
        status={status}
        setStatus={setStatus}
        skill={skill}
        setSkill={setSkill}
        quizSectionId={quizSectionId}
        setQuizSectionId={setQuizSectionId}
        types={types}
        sections={sections}
        onSubmit={handleSubmit}
        onChangeSection={onChangeSection}
      />

      <div className="rounded-xl border p-3 sm:p-4">
        <QuizList
          items={items}
          loading={loading}
          onDelete={openDeleteDialog}
          onStatusChange={handleStatusChange}
        />

        {!loading && items.length > 0 && totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <QuizPagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <DeleteQuizDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        quiz={quizToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
