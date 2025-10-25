"use client";
import { toast } from 'sonner';

import { useEffect, useState } from "react";
// import AdminSidebar from "@/components/common/AdminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { adminListReports, adminResolveReport, adminHidePost, adminUnhidePost, adminDeletePost } from "@/lib/api/forum/forum";

export default function AdminForumReportsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0 });
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const [type, setType] = useState("THREAD");
  const [onlyOpen, setOnlyOpen] = useState("true");

  async function load(p = page) {
    const params = { page: p + 1, pageSize, type, onlyOpen: onlyOpen === "true" };
    const { items, meta } = await adminListReports(params);
    setItems(items); setMeta(meta);
  }
  useEffect(()=>{ setPage(0); }, [type, onlyOpen]);
  useEffect(()=>{ load(page); }, [page, type, onlyOpen]);

  async function resolve(id) {
    const adminId = typeof window !== "undefined" ? localStorage.getItem("x-user-id") : undefined;
    await adminResolveReport(id, { adminId });
    await load(page);
  }

  return (
    <div className="flex">
      {/* <AdminSidebar /> */}
      <div className="p-4 w-full space-y-4">
        <h1 className="text-2xl font-semibold">Forum • Báo cáo</h1>

        <Card>
          <CardHeader><CardTitle>Bộ lọc</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Đối tượng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="THREAD">Chủ đề</SelectItem>
                <SelectItem value="POST">Bài viết</SelectItem>
              </SelectContent>
            </Select>
            <Select value={onlyOpen} onValueChange={setOnlyOpen}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Chưa xử lý</SelectItem>
                <SelectItem value="false">Tất cả</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Danh sách</CardTitle>
            <Pagination currentPage={page} totalPages={meta?.pages ?? 0} onPageChange={setPage} />
          </CardHeader>
          <CardContent className="grid gap-2">
            {items.map(r => (
              <div key={r.id} className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground">
                  {r.targetType} • {r.targetId} • {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                </div>
                {/* Reporter & Preview */}
                <div className="mt-2 text-sm">
                  <div><b>Người báo cáo:</b> {r.reporterName || r.userId}</div>
                  {r.targetType === 'POST' && r.targetPreview && (
                    <div className="mt-1 p-2 rounded bg-muted/40">
                      <div className="text-xs text-muted-foreground mb-1">Nội dung bình luận bị báo cáo</div>
                      <div className="whitespace-pre-wrap">{r.targetPreview}</div>
                    </div>
                  )}
                </div>
                <div className="mt-1">{r.reason}</div>
                <div className="mt-2">
                  {r.resolvedAt ? (
                    <span className="text-xs">Đã xử lý lúc {new Date(r.resolvedAt).toLocaleString()}</span>
                  ) : (
                    <Button size="sm" onClick={()=>resolve(r.id)}>Đánh dấu đã xử lý</Button>
                  )}
                
                  {/*__POST_MOD__*/}
                  {/* {r.targetType === 'POST' && (
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="secondary" onClick={async()=>{ await adminHidePost(r.targetId); toast.success('Đã ẩn bài'); await load(page); }}>Ẩn</Button>
                      <Button size="sm" variant="secondary" onClick={async()=>{ await adminUnhidePost(r.targetId); toast.success('Đã hiện bài'); await load(page); }}>Hiện</Button>
                      <Button size="sm" variant="destructive" onClick={async()=>{ if(!confirm('Xóa bài này?')) return; await adminDeletePost(r.targetId); toast.success('Đã xóa'); await load(page); }}>Xóa</Button>
                    </div>
                  )} */}
                  {r.targetType === 'POST' && (
                    <div className="mt-2 flex gap-2">
                      {/* Nếu đang HIỆN → chỉ cho ẨN */}
                      {r.targetPublished === true && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => { await adminHidePost(r.targetId); toast.success('Đã ẩn bài'); await load(page); }}
                        >
                          Ẩn
                        </Button>
                      )}

                      {/* Nếu đang ẨN → chỉ cho HIỆN */}
                      {r.targetPublished === false && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => { await adminUnhidePost(r.targetId); toast.success('Đã hiện bài'); await load(page); }}
                        >
                          Hiện
                        </Button>
                      )}

                      {/* Dữ liệu cũ chưa có trạng thái (null) → cho cả hai để admin xử lý */}
                      {r.targetPublished == null && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => { await adminHidePost(r.targetId); toast.success('Đã ẩn bài'); await load(page); }}
                          >
                            Ẩn
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => { await adminUnhidePost(r.targetId); toast.success('Đã hiện bài'); await load(page); }}
                          >
                            Hiện
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!confirm('Xóa bài này?')) return;
                          await adminDeletePost(r.targetId);
                          toast.success('Đã xóa');
                          await load(page);
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  )}
        </div>
              </div>
            ))}
            {items.length===0 && <div className="text-sm text-muted-foreground">Không có báo cáo</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}