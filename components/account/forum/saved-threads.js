"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
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
import ThreadListFilters from "@/components/forum/thread-list-filters";
import { getSavedThreads, getForumCategories, toggleSaveThread } from "@/lib/api/forum";
import Link from "next/link";
import { toast } from "sonner";
import { BookmarkX, Eye, MessageSquare, Clock } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";

export default function SavedThreads() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0 });
  
  // FIX: Đổi page base thành 1
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  // Load danh mục
  useEffect(() => {
    async function loadCategories() {
      const result = await getForumCategories();
      if (result.success) setCats(result.data);
    }
    loadCategories();
  }, []);

  // Hàm load dữ liệu chính
  async function load(p = page, f = filters) {
    setLoading(true);
    try {
      const result = await getSavedThreads({
        ...f,
        page: p, // FIX: Giữ nguyên p (vì đã base 1)
        pageSize,
      });

      if (result.success) {
        const data = result.data;
        setItems(data?.content || data?.result || []);
        // Meta page từ API trả về
        setMeta(data?.meta || { page: p, pages: data?.totalPages || 0 });
      } else {
        toast.error(result.error || "Không tải được danh sách đã lưu");
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  }

  // Reload khi page hoặc filters thay đổi
  useEffect(() => {
    if (filters !== null) {
      load(page, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  // FIX: Reset về trang 1 khi đổi bộ lọc
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Xử lý logic gọi API xóa (được gọi từ AlertDialogAction)
  const onConfirmUnsave = async (id) => {
    try {
      const res = await toggleSaveThread(id);
      if (res.success) {
        toast.success("Đã bỏ lưu bài viết");
        
        // Xóa item khỏi UI
        setItems((prev) => prev.filter((item) => item.id !== id));
        
        // FIX: Logic lùi trang nếu xóa hết item
        if (items.length === 1 && page > 1) {
          setPage(page - 1);
        } else if (items.length === 1 && page === 1) {
          // Nếu trang 1 xóa hết thì reload để hiện empty state
          load(1, filters);
        }
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Lỗi khi bỏ lưu");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bài viết đã lưu</h2>
        <Link href="/account">
          <Button variant="outline">Quay lại tài khoản</Button>
        </Link>
      </div>

      {/* --- Bộ lọc --- */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <ThreadListFilters categories={cats} onChange={handleFilterChange} />
        </CardContent>
      </Card>

      {/* --- Danh sách bài viết --- */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          ) : items.length > 0 ? (
            <div className="divide-y">
              {items.map((t) => (
                <div
                  key={t.id}
                  className="p-4 hover:bg-muted/40 transition-colors flex gap-4 group items-start"
                >
                  {/* Nội dung bài viết */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/forum/${t.slug}`}
                      className="block group-hover:text-primary transition-colors"
                    >
                      <h3 className="font-semibold truncate text-lg mb-1">
                        {t.title}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {t.categories?.map((c) => (
                        <span
                          key={c.id}
                          className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full border"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <UserAvatar
                          src={t.authorAvatarUrl}
                          name={t.authorName}
                          className="w-4 h-4"
                        />
                        <span>{t.authorName || "Ẩn danh"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleDateString("vi-VN")
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{t.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span>{t.replyCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Nút Bỏ lưu với AlertDialog */}
                  <div className="flex-shrink-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          title="Bỏ lưu"
                          // FIX: Ngăn chặn click lan ra ngoài (quan trọng)
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BookmarkX className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bỏ lưu bài viết?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn bỏ lưu bài viết "<b>{t.title}</b>" không?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onConfirmUnsave(t.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Bỏ lưu
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <BookmarkX className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Chưa có bài viết nào</h3>
              <p className="text-muted-foreground mt-1">
                Các bài viết bạn lưu sẽ xuất hiện tại đây.
              </p>
              <div className="mt-4">
                <Link href="/forum">
                  <Button>Dạo một vòng diễn đàn</Button>
                </Link>
              </div>
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