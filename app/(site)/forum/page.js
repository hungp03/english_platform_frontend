"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import ThreadListFilters from "@/components/forum/thread-list-filters";
import { forumListThreads,forumListCategories } from "@/lib/api/forum/forum";
import Link from "next/link";
import { Button } from "@/components/ui/button";


export default function ForumIndexPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0 });
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({});
  const [cats, setCats] = useState([]);
  // const [canCreate, setCanCreate] = useState(false);
  const pageSize = 20;

  async function load(p = page, f = filters) {
    const { items, meta } = await forumListThreads({ ...f, page: p + 1, pageSize });
    setItems(items);
    setMeta(meta);
  }

  useEffect(() => { forumListCategories().then(setCats); }, []);
  useEffect(() => { setPage(0); }, [JSON.stringify(filters)]);
  useEffect(() => { load(page, filters); }, [page, filters]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* <h1 className="text-3xl font-bold">Diễn đàn</h1> */}
            <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Diễn đàn</h1>
        
          <Link href="/forum/new">
            <Button>Tạo chủ đề</Button>
          </Link>
         
      </div>

      <Card>
        <CardHeader><CardTitle>Bộ lọc</CardTitle></CardHeader>
        <CardContent>
          <ThreadListFilters categories={cats} onChange={setFilters} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Chủ đề</CardTitle>
          <Pagination currentPage={page} totalPages={meta?.pages ?? 0} onPageChange={(p)=>setPage(p)} />
        </CardHeader>
        <CardContent className="grid gap-2">
          {items.map(t => (
            <Link key={t.id} href={`/forum/${t.slug}`} className="border rounded-md p-3 hover:bg-muted/40">
              <div className="font-medium">{t.title}</div>
              {/*__AUTHOR_LIST__*/}
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <img src={t.authorAvatarUrl || "/avatar.svg"} className="w-5 h-5 rounded-full object-cover" alt=""/>
                <span>{t.authorName || "Ẩn danh"}</span>
                <span>•</span>
                <span>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {t.replyCount} trả lời • {t.viewCount} lượt xem • {t.locked ? "Đã khóa" : "Đang mở"}
              </div>
            </Link>
          ))}
          {items.length === 0 && <div className="text-sm text-muted-foreground">Không có chủ đề.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
