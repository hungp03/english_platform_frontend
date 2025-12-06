"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import CategoryForm from "@/components/content/category-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DeleteItemDialog from "@/components/content/delete-content-dialog";
import { toast } from "sonner";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/content/categories";
import { FolderOpen, Plus, Search, Pencil, Trash2, Tag } from "lucide-react";

const SKELETON_COUNT = 5;

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.slug?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCategories();
      if (res.success) {
        const data = res.data;
        const categories = data?.result || [];
        setItems(categories);
        setTotalCount(data?.meta?.total ?? categories.length);
      } else {
        toast.error(res.error || "Tải danh mục thất bại");
      }
    } catch (err) {
      toast.error("Tải danh mục thất bại");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = useCallback(async (payload) => {
    setCreating(true);
    try {
      const res = await createCategory(payload);
      if (res.success) {
        toast.success("Tạo danh mục thành công");
        setOpenCreate(false);
        await load();
      } else {
        toast.error(res.error || "Tạo danh mục thất bại");
      }
    } finally {
      setCreating(false);
    }
  }, [load]);

  const onUpdate = useCallback(async (payload) => {
    if (!editingCategory) return;
    setUpdating(true);
    try {
      const res = await updateCategory(editingCategory.id, payload);
      if (res.success) {
        toast.success("Cập nhật danh mục thành công");
        setOpenEdit(false);
        setEditingCategory(null);
        await load();
      } else {
        toast.error(res.error || "Cập nhật danh mục thất bại");
      }
    } finally {
      setUpdating(false);
    }
  }, [editingCategory, load]);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      const res = await deleteCategory(deleteId);
      if (res.success) {
        toast.success("Đã xoá danh mục");
      } else {
        toast.error(res.error || "Xoá danh mục thất bại");
      }
    } catch (err) {
      toast.error("Xoá danh mục thất bại");
    } finally {
      setOpenDelete(false);
      setDeleteId(null);
      setDeleteTitle("");
      await load();
    }
  }, [deleteId, load]);

  const askDelete = useCallback((cat) => {
    setDeleteId(cat.id);
    setDeleteTitle(cat.name || "(không tên)");
    setOpenDelete(true);
  }, []);

  const openEditDialog = useCallback((cat) => {
    setEditingCategory(cat);
    setOpenEdit(true);
  }, []);

  const handleOpenCreate = useCallback(() => setOpenCreate(true), []);
  const handleSearchChange = useCallback((e) => setSearchQuery(e.target.value), []);

  return (
    <div className="flex">
      <div className="p-6 w-full space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Quản lý danh mục</h1>
              <p className="text-sm text-muted-foreground">
                Tổ chức và phân loại nội dung blog
              </p>
            </div>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo danh mục
          </Button>
        </div>

        <Card className="w-fit">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Tag className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-sm text-muted-foreground">Tổng danh mục</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Danh sách danh mục</CardTitle>
                <CardDescription>
                  Quản lý tất cả danh mục bài viết của bạn
                </CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm danh mục..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: SKELETON_COUNT }, (_, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">
                  {searchQuery ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {searchQuery
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Bắt đầu bằng cách tạo danh mục đầu tiên để tổ chức bài viết"}
                </p>
                {!searchQuery && (
                  <Button onClick={handleOpenCreate} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo danh mục
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Tên danh mục</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                      <TableHead className="text-right w-[120px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                              <Tag className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{c.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {c.slug || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
                            {c.description || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(c)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => askDelete(c)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Xóa</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo danh mục mới</DialogTitle>
              <DialogDescription>
                Thêm danh mục mới để phân loại bài viết
              </DialogDescription>
            </DialogHeader>
            <CategoryForm onSubmit={onCreate} submitting={creating} />
          </DialogContent>
        </Dialog>

        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin danh mục
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              initial={editingCategory}
              onSubmit={onUpdate}
              submitting={updating}
            />
          </DialogContent>
        </Dialog>

        <DeleteItemDialog
          open={openDelete}
          onOpenChange={setOpenDelete}
          itemTitle={deleteTitle}
          onConfirm={confirmDelete}
          title="Xóa danh mục"
          description={`Bạn có chắc chắn muốn xóa danh mục "${deleteTitle}"?\n\nHành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
        />
      </div>
    </div>
  );
}
