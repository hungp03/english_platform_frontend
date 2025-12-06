"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MessageSquare, Folder, Plus, Pencil, Trash2, FolderOpen } from "lucide-react";

import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "@/lib/api/forum";

const INITIAL_FORM = { name: "", description: "" };

const PageHeader = memo(function PageHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <MessageSquare className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Danh mục Forum</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý các danh mục thảo luận trong forum
        </p>
      </div>
    </div>
  );
});

const AddCategoryForm = memo(function AddCategoryForm({ onSave, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleSubmit = useCallback(async () => {
    const success = await onSave(form);
    if (success) {
      setForm(INITIAL_FORM);
    }
  }, [form, onSave]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Thêm danh mục mới
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Tên danh mục *"
          value={form.name}
          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
        />
        <Input
          placeholder="Mô tả (tùy chọn)"
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang lưu..." : "Thêm danh mục"}
        </Button>
      </CardContent>
    </Card>
  );
});

const EditCategoryDialog = memo(function EditCategoryDialog({ 
  category, 
  open, 
  onOpenChange, 
  onSave, 
  loading 
}) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        description: category.description || "",
      });
    }
  }, [category]);

  const handleSubmit = useCallback(async () => {
    const success = await onSave(category?.id, form);
    if (success) {
      onOpenChange(false);
    }
  }, [category?.id, form, onSave, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Sửa danh mục
          </AlertDialogTitle>
          <AlertDialogDescription>
            Chỉnh sửa thông tin danh mục
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 py-4">
          <Input
            placeholder="Tên danh mục *"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Mô tả (tùy chọn)"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : "Cập nhật"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

const CategoryItem = memo(function CategoryItem({ category, onEdit, onDelete }) {
  const handleEdit = useCallback(() => {
    onEdit(category);
  }, [category, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(category.id);
  }, [category.id, onDelete]);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
          <Folder className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate">{category.name}</div>
          <div className="text-xs text-muted-foreground truncate">{category.slug}</div>
          {category.description && (
            <div className="text-sm text-muted-foreground truncate mt-0.5">
              {category.description}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0 ml-4">
        <Button variant="outline" size="sm" onClick={handleEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
              <AlertDialogDescription>
                Danh mục &quot;{category.name}&quot; sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-destructive hover:bg-destructive/90"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
});

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
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
      <h3 className="text-lg font-semibold mb-1">Chưa có danh mục</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Thêm danh mục đầu tiên để bắt đầu tổ chức các chủ đề thảo luận
      </p>
    </div>
  );
}

export default function AdminForumCategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = useCallback(async () => {
    const result = await adminGetCategories();
    if (result.success) {
      setItems(result.data);
    } else {
      toast.error(result.error || "Không thể tải danh sách danh mục");
    }
    setFetching(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAdd = useCallback(async (form) => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return false;
    }
    
    setLoading(true);
    try {
      const result = await adminCreateCategory(form);
      if (result.success) {
        toast.success("Thêm danh mục thành công");
        await loadCategories();
        return true;
      } else {
        toast.error(result.error || "Không thể thêm danh mục");
        return false;
      }
    } finally {
      setLoading(false);
    }
  }, [loadCategories]);

  const handleUpdate = useCallback(async (id, form) => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return false;
    }
    
    const previousItems = items;
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...form } : item
    ));
    
    setLoading(true);
    try {
      const result = await adminUpdateCategory(id, form);
      if (result.success) {
        toast.success("Cập nhật danh mục thành công");
        return true;
      } else {
        setItems(previousItems);
        toast.error(result.error || "Không thể cập nhật danh mục");
        return false;
      }
    } catch {
      setItems(previousItems);
      toast.error("Không thể cập nhật danh mục");
      return false;
    } finally {
      setLoading(false);
    }
  }, [items]);

  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
  }, []);

  const handleEditDialogChange = useCallback((open) => {
    if (!open) setEditingCategory(null);
  }, []);

  const handleDelete = useCallback(async (id) => {
    const previousItems = items;
    setItems(prev => prev.filter(item => item.id !== id));
    
    const result = await adminDeleteCategory(id);
    if (result.success) {
      toast.success("Xóa danh mục thành công");
    } else {
      setItems(previousItems);
      toast.error(result.error || "Không thể xóa danh mục");
    }
  }, [items]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader />

      <AddCategoryForm onSave={handleAdd} loading={loading} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách danh mục</CardTitle>
          <CardDescription>
            {!fetching && `${items.length} danh mục`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <LoadingSkeleton />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {items.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditCategoryDialog
        category={editingCategory}
        open={!!editingCategory}
        onOpenChange={handleEditDialogChange}
        onSave={handleUpdate}
        loading={loading}
      />
    </div>
  );
}