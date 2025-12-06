"use client";
import { useEffect, useState } from "react";
// import AdminSidebar from "@/components/common/AdminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import ThreadListFilters from "@/components/forum/thread-list-filters";
import {
  adminGetThreads,
  adminLockThread,
  adminUnlockThread,
  adminDeleteThread,
  getForumCategories,
} from "@/lib/api/forum";
import { toast } from "sonner";

// Reuse alert-dialog confirm
import DeleteItemDialog from "@/components/content/delete-content-dialog";

export default function AdminForumThreadsPage() {
  const [cats, setCats] = useState([]);
  const [filters, setFilters] = useState({});
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0 });
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Dialog xoá
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState("");

  async function load(p = page, f = filters) {
    const params = { ...f, page: p, pageSize };
    const result = await adminGetThreads(params);
    if (result.success) {
      const data = result.data;
      setItems(data?.content || data?.result || []);
      setMeta(data?.meta || { page: p, pages: data?.totalPages || 0 });
    } else {
      toast.error(result.error || "Không thể tải danh sách chủ đề");
      setItems([]);
      setMeta({ page: p, pages: 0 });
    }
  }

  useEffect(() => {
    async function loadCategories() {
      const result = await getForumCategories();
      if (result.success) {
        setCats(result.data);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    load(page, filters);
  }, [page, filters]);

  function askDelete(thread) {
    setDeleteId(thread.id);
    setDeleteTitle(thread.title || "(không tiêu đề)");
    setOpenDelete(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const result = await adminDeleteThread(deleteId);
    if (result.success) {
      toast.success("Đã xóa chủ đề");
      setOpenDelete(false);
      setDeleteId(null);
      setDeleteTitle("");
      await load();
    } else {
      toast.error(result.error || "Xóa thất bại, vui lòng thử lại");
    }
  }

  async function handleLock(id, title) {
    const result = await adminLockThread(id);
    if (result.success) {
      toast.success(`Đã khóa: "${title || "chủ đề"}"`);
      await load();
    } else {
      toast.error(result.error || "Khóa thất bại");
    }
  }

  async function handleUnlock(id, title) {
    const result = await adminUnlockThread(id);
    if (result.success) {
      toast.success(`Đã mở khóa: "${title || "chủ đề"}"`);
      await load();
    } else {
      toast.error(result.error || "Mở khóa thất bại");
    }
  }

  return (
    <div className="flex">
      {/* <AdminSidebar /> */}
      <div className="p-4 w-full space-y-4">
        <h1 className="text-2xl font-semibold">Forum • Chủ đề</h1>

        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <ThreadListFilters categories={cats} onChange={setFilters} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Danh sách</CardTitle>
            <Pagination
              currentPage={page}
              totalPages={meta?.pages ?? 0}
              onPageChange={setPage}
            />
          </CardHeader>
          <CardContent className="grid gap-2">
            {items.map((t) => (
              <div key={t.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.replyCount} phản hồi • {t.viewCount} lượt xem •{" "}
                      {t.locked ? "Đã khóa" : "Đang mở"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {t.locked ? (
                      <Button
                        variant="secondary"
                        onClick={() => handleUnlock(t.id, t.title)}
                      >
                        Mở khóa
                      </Button>
                    ) : (
                      <Button onClick={() => handleLock(t.id, t.title)}>
                        Khóa
                      </Button>
                    )}
                    <Button variant="destructive" onClick={() => askDelete(t)}>
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Không có chủ đề
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog cảnh báo xoá (dùng @/components/ui/alert-dialog) */}
        <DeleteItemDialog
          open={openDelete}
          onOpenChange={setOpenDelete}
          itemTitle={deleteTitle}
          onConfirm={confirmDelete}
          title="Xóa chủ đề"
          description={`Bạn có chắc chắn muốn xóa chủ đề "${deleteTitle}"?\n\nHành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
        />
      </div>
    </div>
  );
}
