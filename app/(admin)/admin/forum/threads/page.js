"use client";
import { useEffect, useState } from "react";
// import AdminSidebar from "@/components/common/AdminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import ThreadListFilters from "@/components/forum/thread-list-filters";
import { adminListThreads, adminLockThread, adminUnlockThread, adminDeleteThread } from "@/lib/api/forum/forum";
import { forumListCategories } from "@/lib/api/forum/forum";

export default function AdminForumThreadsPage() {
  const [cats, setCats] = useState([]);
  const [filters, setFilters] = useState({});
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0 });
  const [page, setPage] = useState(0);
  const pageSize = 20;

  async function load(p=page, f=filters) {
    const { items, meta } = await adminListThreads({ ...f, page: p + 1, pageSize });
    setItems(items); setMeta(meta);
  }
  useEffect(()=>{ forumListCategories().then(setCats); },[]);
  useEffect(()=>{ setPage(0); }, [JSON.stringify(filters)]);
  useEffect(()=>{ load(page, filters); }, [page, filters]);

  return (
    <div className="flex">
      {/* <AdminSidebar /> */}
      <div className="p-4 w-full space-y-4">
        <h1 className="text-2xl font-semibold">Forum • Chủ đề</h1>

        <Card>
          <CardHeader><CardTitle>Bộ lọc</CardTitle></CardHeader>
          <CardContent><ThreadListFilters categories={cats} onChange={setFilters} /></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Danh sách</CardTitle>
            <Pagination currentPage={page} totalPages={meta?.pages ?? 0} onPageChange={setPage} />
          </CardHeader>
          <CardContent className="grid gap-2">
            {items.map(t => (
              <div key={t.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.replyCount} phản hồi • {t.viewCount} lượt xem • {t.locked ? "Đã khóa" : "Đang mở"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {t.locked ? (
                      <Button variant="secondary" onClick={async()=>{ await adminUnlockThread(t.id); await load(); }}>Mở khóa</Button>
                    ) : (
                      <Button onClick={async()=>{ await adminLockThread(t.id); await load(); }}>Khóa</Button>
                    )}
                    <Button variant="destructive" onClick={async()=>{ if(confirm("Xóa chủ đề?")) { await adminDeleteThread(t.id); await load(); }}}>Xóa</Button>
                  </div>
                </div>
              </div>
            ))}
            {items.length===0 && <div className="text-sm text-muted-foreground">Không có chủ đề</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
