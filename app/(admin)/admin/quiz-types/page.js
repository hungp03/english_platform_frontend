"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  listQuizTypes,
  createQuizType,
  updateQuizType,
  deleteQuizType,
} from "@/lib/api/quiz/quiz-type";
import { toast } from "sonner";
import QuizTypeList from "@/components/admin/quiz-type/quiz-type-list";
import QuizTypeFormDialog from "@/components/admin/quiz-type/quiz-type-form-dialog";
import QuizTypeDeleteDialog from "@/components/admin/quiz-type/quiz-type-delete-dialog";
import { ClipboardList, Plus } from "lucide-react";

const PageHeader = memo(function PageHeader({ onCreate }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Quản lý loại đề thi</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Tạo và quản lý các loại đề thi trên hệ thống
          </p>
        </div>
      </div>
      <Button onClick={onCreate} size="sm" className="sm:size-default flex-shrink-0">
        <Plus className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Thêm loại đề</span>
      </Button>
    </div>
  );
});

const unwrapData = (res) => (res?.data ?? res);

export default function QuizTypesPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  const resetForm = useCallback(() => {
    setForm({ name: "", description: "" });
    setEditingId(null);
  }, []);

  const handleFormDialogChange = useCallback((open) => {
    setFormDialogOpen(open);
    if (!open) {
      resetForm();
    }
  }, [resetForm]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listQuizTypes();
      const data = unwrapData(res);
      setList(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Lỗi", { description: "Tên loại đề thi không được để trống" });
      return;
    }

    try {
      if (editingId) {
        const result = await updateQuizType(editingId, {
          name: form.name,
          description: form.description,
        });
        const updatedItem = unwrapData(result);
        setList((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...(updatedItem?.id ? updatedItem : { name: form.name, description: form.description }),
                }
              : item
          )
        );
        toast.success("Cập nhật thành công", { description: "QuizType đã được lưu!" });
      } else {
        const result = await createQuizType(form);
        const createdItem = unwrapData(result);
        if (createdItem?.id) {
          setList((prev) => [createdItem, ...prev]);
        } else {
          await load();
        }
        toast.success("Tạo mới thành công", { description: "QuizType mới đã được thêm!" });
      }
      resetForm();
      setFormDialogOpen(false);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể lưu QuizType";
      const errorCode = error?.response?.data?.code;
      toast.error("Lỗi", {
        description: `${errorMessage}${errorCode ? ` (Mã: ${errorCode})` : ""}`
      });
    }
  }, [form, editingId, load, resetForm]);

  const onEdit = useCallback((item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
    });
    setFormDialogOpen(true);
  }, []);

  const onCreate = useCallback(() => {
    resetForm();
    setFormDialogOpen(true);
  }, [resetForm]);

  const openDeleteDialog = useCallback((id) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  }, []);

  const onConfirmDelete = useCallback(async () => {
    if (!deleteTargetId) return;

    const previousList = list;
    setList((prev) => prev.filter((item) => item.id !== deleteTargetId));
    setDeleteDialogOpen(false);

    try {
      await deleteQuizType(deleteTargetId);
      toast.success("Xóa thành công", { description: "QuizType đã bị xóa." });
    } catch (error) {
      setList(previousList);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể xóa QuizType này";
      const errorCode = error?.response?.data?.code;
      toast.error("Lỗi", {
        description: `${errorMessage}${errorCode ? ` (Mã: ${errorCode})` : ""}`
      });
    } finally {
      setDeleteTargetId(null);
    }
  }, [deleteTargetId, list]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader onCreate={onCreate} />

      <QuizTypeList
        list={list}
        loading={loading}
        onEdit={onEdit}
        onDelete={openDeleteDialog}
      />

      <QuizTypeDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={onConfirmDelete}
      />

      <QuizTypeFormDialog
        open={formDialogOpen}
        onOpenChange={handleFormDialogChange}
        form={form}
        setForm={setForm}
        onSubmit={onSubmit}
        editingId={editingId}
      />
    </div>
  );
}
