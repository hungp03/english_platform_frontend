"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import ThreadListFilters from "@/components/forum/thread-list-filters";
import { getForumThreads, getForumCategories } from "@/lib/api/forum";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store"; 
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ForumContent() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0 });
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState(null); // null = chưa nhận filters từ ThreadListFilters
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  // Không sử dụng useCallback với dependencies - gây re-render không cần thiết
  const load = useCallback(async (p, f) => {
    setLoading(true);
    const result = await getForumThreads({ ...f, page: p + 1, pageSize });
    if (result.success) {
      const data = result.data;
      setItems(data?.content || data?.result || []);
      setMeta(data?.meta || { page: p + 1, pages: data?.totalPages || 0 });
    } else {
      toast.error(result.error || "Không thể tải danh sách chủ đề");
      setItems([]);
      setMeta({ page: 1, pages: 0 });
    }
    setLoading(false);
  }, []); // Empty dependencies - function never changes

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  // Load categories chỉ 1 lần khi mount
  useEffect(() => {
    async function init() {
      const result = await getForumCategories();
      if (result.success) {
        setCats(result.data);
      }
    }
    init();
  }, []);

  // Khi filters thay đổi (từ ThreadListFilters), load data
  useEffect(() => {
    if (filters !== null) {
      setPage(0);
      load(0, filters);
    }
  }, [filtersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Khi page thay đổi (không phải page 0)
  useEffect(() => {
    if (filters !== null && page !== 0) {
      load(page, filters);
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleCreateThread = useCallback((e) => {
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      return;
    }

    if (!user) {
      e.preventDefault();
      toast.error("Vui lòng đăng nhập để tạo chủ đề mới");
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Diễn đàn
          </h1>
          
          <Link
            href={user ? "/forum/new" : "/login"}
            onClick={handleCreateThread}
          >
            <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
              Tạo chủ đề
            </Button>
          </Link>
          
        </div>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
             <CardTitle className="text-lg sm:text-xl">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <ThreadListFilters categories={cats} onChange={setFilters} />
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Chủ đề</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              // Loading skeleton
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                     <Skeleton className="h-6 w-3/4" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {items.map(t => (
                  <Link
                    key={t.id}
                    href={`/forum/${t.slug}`}
                    className="block border rounded-lg p-4 hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 hover:shadow-md group"
                  >
                    <div className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {t.title}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={t.authorAvatarUrl}
                          name={t.authorName}
                          className="w-6 h-6 sm:w-7 sm:h-7"
                        />
                        <span className="font-medium">{t.authorName || "Ẩn danh"}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-xs">{t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : ""}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                         <span className="font-medium text-primary">{t.replyCount}</span> trả lời
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">{t.viewCount}</span> lượt xem
                      </span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.locked ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                         {t.locked ? "Đã khóa" : "Đang mở"}
                      </span>
                    </div>
                  </Link>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-base">Không có chủ đề.</p>
                  </div>
                )}

                {meta?.pages > 1 && (
                   <div className="mt-4">
                    <Pagination currentPage={page} totalPages={meta?.pages ?? 0} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}