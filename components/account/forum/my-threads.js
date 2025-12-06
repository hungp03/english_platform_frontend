"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import ThreadListFilters from "@/components/forum/thread-list-filters";
import { getMyThreads, getForumCategories, deleteOwnThread } from "@/lib/api/forum";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit } from "lucide-react";
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

export default function MyForumThreads() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0 });
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({});
  const [cats, setCats] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const pageSize = 20;

  async function load(p = page, f = filters) {
    try {
      const result = await getMyThreads({
        ...f,
        page: p + 1,
        pageSize,
      });
      if (result.success) {
        const data = result.data;
        setItems(data?.content || data?.result || []);
        setMeta(data?.meta || { page: p + 1, pages: data?.totalPages || 0 });
      } else {
        toast.error(result.error || "Không tải được chủ đề");
        setItems([]);
        setMeta({ page: p + 1, pages: 0 });
      }
    } catch (err) {
      console.error("Không tải được chủ đề:", err);
      toast.error("Không tải được chủ đề. Vui lòng thử lại.");
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
    setPage(0);
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    load(page, filters);
  }, [page, filters]);

  const handleDelete = (id) => async () => {
    setDeletingId(id);
    try {
      const result = await deleteOwnThread(id);
  
      if (result.success) {
        toast.success("Đã xóa chủ đề");
        await load(page, filters);
      } else {
        toast.error(result.error || "Không thể xóa chủ đề");
      }
    } catch (err) {
      console.error("Lỗi xóa:", err);
      toast.error("Không thể xóa chủ đề, vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  };
  

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bài viết diễn đàn của tôi</h2>
        <div className="flex items-center gap-2">
            <Link href="/account">
                <Button variant="outline">Quay lại tài khoản</Button>
            </Link>
            <Link href="/forum/new">
                <Button>Tạo chủ đề</Button>
            </Link>
        </div>
      </div>

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
          <CardTitle>Chủ đề của tôi</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-2">
          {items.map((t) => (
            <div
              key={t.id}
              className="border rounded-md p-3 hover:bg-muted/40 flex justify-between items-start"
            >
              <Link href={`/forum/${t.slug}`} className="flex-1">
                <div className="font-medium">{t.title}</div>

                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <img
                    src={t.authorAvatarUrl || "/avatar.svg"}
                    className="w-5 h-5 rounded-full object-cover"
                    alt=""
                  />
                  <span>{t.authorName || "Bạn"}</span>
                  <span>•</span>
                  <span>
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  {t.replyCount} trả lời • {t.viewCount} lượt xem •{" "}
                  {t.locked ? "Đã khóa" : "Đang mở"}
                </div>
              </Link>

              <div className="flex gap-2 ml-3">
                {!t.locked && (
                  <Link href={`/forum/${t.slug}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Xóa</Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa chủ đề?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Chủ đề sẽ bị xóa vĩnh viễn.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>

                      <AlertDialogAction asChild>
                        <Button
                          variant="destructive"
                          onClick={handleDelete(t.id)}
                          disabled={deletingId === t.id}
                        >
                          {deletingId === t.id ? "Đang xóa..." : "Xóa"}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Bạn chưa đăng chủ đề nào.
            </div>
          )}
        </CardContent>
      </Card>

      {meta?.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={meta?.pages ?? 0}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
}