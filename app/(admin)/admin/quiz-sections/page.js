"use client";

import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { listQuizTypes } from "@/lib/api/quiz/quiz-type";
import {
  pageQuizSections,
  pageQuizSectionsByType,
  deleteQuizSection,
  createQuizSection,
  updateQuizSection,
} from "@/lib/api/quiz/quiz-section";
import QuizSectionForm from "@/components/quiz/quiz-section-form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Layers,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  BookOpen,
  FolderOpen,
} from "lucide-react";

const SKILLS = ["LISTENING", "READING", "SPEAKING", "WRITING"];

const PageHeader = memo(function PageHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
        <Layers className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Quản lý phần thi</h1>
        <p className="text-sm text-muted-foreground hidden sm:block">
          Tạo và quản lý các phần thi trên hệ thống
        </p>
      </div>
    </div>
  );
});

const SectionFilters = memo(function SectionFilters({ filterType, onFilterTypeChange, keyword, onKeywordChange, types }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Tìm kiếm theo tên..."
          className="pl-9"
        />
      </div>
      <Select value={filterType} onValueChange={onFilterTypeChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
          <SelectValue placeholder="Chọn loại đề" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          {types.map((t) => (
            <SelectItem key={t.id} value={String(t.id)}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

const SectionItem = memo(function SectionItem({ item, isEditing, editRow, onEditRowChange, types, onStartEdit, onCancelEdit, onSaveEdit, onDelete }) {
  const skill = String(item.skill || item.sectionSkill || item.quizSkill || "");

  if (isEditing) {
    return (
      <div className="border rounded-lg p-3 sm:p-4 bg-muted/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            value={editRow.name}
            onChange={(e) => onEditRowChange({ ...editRow, name: e.target.value })}
            placeholder="Tên phần thi"
          />
          <Select
            value={editRow.quizTypeId}
            onValueChange={(v) => onEditRowChange({ ...editRow, quizTypeId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại đề" />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={editRow.skill}
            onValueChange={(v) => onEditRowChange({ ...editRow, skill: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn kỹ năng" />
            </SelectTrigger>
            <SelectContent>
              {SKILLS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button size="sm" onClick={() => onSaveEdit(item.id)}>
              Lưu
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              Hủy
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm sm:text-base truncate">{item.name}</div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <Badge variant="outline" className="text-xs">
                {item.quizTypeName}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {skill}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <Button size="sm" variant="outline" onClick={() => onStartEdit(item)} className="flex-1 sm:flex-none">
            <Pencil className="h-4 w-4 sm:mr-1" />
            <span className="sm:inline">Sửa</span>
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive flex-1 sm:flex-none" onClick={() => onDelete(item)}>
            <Trash2 className="h-4 w-4 sm:mr-1" />
            <span className="sm:inline">Xóa</span>
          </Button>
        </div>
      </div>
    </div>
  );
});

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-48 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
            </div>
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
      <h3 className="text-lg font-semibold mb-1">Không tìm thấy phần thi</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Không có phần thi nào phù hợp với bộ lọc hiện tại
      </p>
    </div>
  );
}

export default function AdminQuizSectionsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const [types, setTypes] = useState([]);
  const [filterType, setFilterType] = useState("all");

  const [keyword, setKeyword] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({ name: "", quizTypeId: "", skill: "" });

  // State cho delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const typeMap = useMemo(
    () => Object.fromEntries(types.map((t) => [String(t.id), t.name])),
    [types]
  );

  const getErrorMessage = useCallback((error) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    return error?.message || "Có lỗi xảy ra";
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (filterType && filterType !== "all") {
        response = await pageQuizSectionsByType(filterType, { page, pageSize, keyword });
      } else {
        response = await pageQuizSections({ page, pageSize, keyword });
      }

      const data = response?.data || response;
      let rows = Array.isArray(data?.result) ? data.result : [];

      if (keyword) {
        const kw = keyword.trim().toLowerCase();
        rows = rows.filter((x) => String(x?.name || "").toLowerCase().includes(kw));
      }

      setItems(rows);
      setMeta(data?.meta || { page, pageSize, pages: 1, total: rows.length });
    } catch {
      toast.error("Không thể tải dữ liệu phần thi");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterType, keyword]);

  useEffect(() => {
    (async () => {
      try {
        const result = await listQuizTypes();
        const typesList = result?.data || result || [];
        setTypes(Array.isArray(typesList) ? typesList : []);
      } catch {
        setTypes([]);
      }
    })();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = useCallback(async (payload) => {
    try {
      await createQuizSection(payload);
      toast.success("Đã tạo phần thi");
      setPage(1);
      await load();
      setCreateDialogOpen(false);
    } catch (e) {
      const errorMsg = getErrorMessage(e);
      toast.error(errorMsg);
    }
  }, [load, getErrorMessage]);

  const openDeleteDialog = useCallback((section) => {
    setSectionToDelete(section);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteSection = useCallback(async () => {
    if (!sectionToDelete) return;

    const previousItems = items;
    setItems((prev) => prev.filter((item) => item.id !== sectionToDelete.id));
    setDeleteDialogOpen(false);

    try {
      const response = await deleteQuizSection(sectionToDelete.id);

      if (response?.success === false) {
        setItems(previousItems);
        toast.error(response?.message || "Xóa thất bại");
        setSectionToDelete(null);
        return;
      }

      toast.success("Đã xóa phần thi thành công");
      setSectionToDelete(null);
    } catch (e) {
      setItems(previousItems);
      const errorMsg = getErrorMessage(e);
      toast.error(errorMsg);
    }
  }, [sectionToDelete, items, getErrorMessage]);

  const startEdit = useCallback((it) => {
    setEditingId(String(it.id));
    setEditRow({
      name: it.name || "",
      quizTypeId: String(it.quizTypeId || ""),
      skill: String(it.skill || it.sectionSkill || it.quizSkill || "").toUpperCase() || "READING",
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditRow({ name: "", quizTypeId: "", skill: "" });
  }, []);

  const handleEditRowChange = useCallback((newRow) => {
    setEditRow(newRow);
  }, []);

  const saveEdit = useCallback(async (id) => {
    const payload = {
      name: editRow.name?.trim(),
      quizTypeId: editRow.quizTypeId,
      skill: editRow.skill,
    };

    if (!payload.name || !payload.quizTypeId) {
      toast.error("Vui lòng nhập tên và chọn loại đề");
      return;
    }

    try {
      const response = await updateQuizSection(id, payload);

      if (response?.success === false) {
        toast.error(response?.message || "Cập nhật thất bại");
        return;
      }

      setItems((prev) =>
        prev.map((x) =>
          String(x.id) === String(id)
            ? {
                ...x,
                name: payload.name,
                quizTypeId: payload.quizTypeId,
                quizTypeName: typeMap[payload.quizTypeId] || x.quizTypeName,
                skill: payload.skill,
              }
            : x
        )
      );

      toast.success("Đã cập nhật phần thi thành công");
      cancelEdit();
    } catch (e) {
      const errorMsg = getErrorMessage(e);
      toast.error(errorMsg);
    }
  }, [editRow, typeMap, cancelEdit, getErrorMessage]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader />
        <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="sm:size-default flex-shrink-0">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Tạo phần thi</span>
        </Button>
      </div>

      <SectionFilters
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        keyword={keyword}
        onKeywordChange={setKeyword}
        types={types}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách phần thi</CardTitle>
          <CardDescription>
            {!loading && `${items.length} phần thi`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <SectionItem
                  key={it.id}
                  item={it}
                  isEditing={String(editingId) === String(it.id)}
                  editRow={editRow}
                  onEditRowChange={handleEditRowChange}
                  types={types}
                  onStartEdit={startEdit}
                  onCancelEdit={cancelEdit}
                  onSaveEdit={saveEdit}
                  onDelete={openDeleteDialog}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {meta.pages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phần thi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phần thi{" "}
              <strong>"{sectionToDelete?.name}"</strong>?
              {sectionToDelete && (
                <div className="mt-2 text-sm">
                  <div>Loại đề: {sectionToDelete.quizTypeName}</div>
                  <div>Kỹ năng: {sectionToDelete.skill || sectionToDelete.sectionSkill || sectionToDelete.quizSkill || "N/A"}</div>
                </div>
              )}
              <div className="mt-2 text-orange-600 font-medium">
                Hành động này không thể hoàn tác.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm phần thi mới</DialogTitle>
            <DialogDescription>
              Điền đầy đủ thông tin bên dưới để tạo phần thi mới.
            </DialogDescription>
          </DialogHeader>
          <QuizSectionForm onSubmit={onCreate} />
        </DialogContent>
      </Dialog>
    </div>
  );
}