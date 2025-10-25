"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
// import AdminSidebar from "@/components/common/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  adminSearchPostsPaged,
  adminPublishPost,
  adminUnpublishPost,
  adminDeletePost,
} from "@/lib/api/content/posts";
import { Pagination } from "@/components/ui/pagination";
import useDebouncedValue from "@/hooks/useDebouncedValue";

export default function AdminPostsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, 1500);

  const [published, setPublished] = useState("all"); // "all" | "true" | "false"

  // Pagination (0-based cho UI)
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState(0);

  async function load(p = page) {
    setLoading(true);
    try {
      const params = { page: p + 1, pageSize };
      if (debouncedKeyword?.trim()) params.keyword = debouncedKeyword.trim();
      if (published !== "all") params.published = published === "true";

      const { items, meta } = await adminSearchPostsPaged(params);

      // Bảo đảm chia đúng theo published ngay cả khi BE trả trộn
      let filtered = items;
      if (published !== "all") {
        const expect = published === "true";
        filtered = items.filter((x) => !!x.published === expect);
      }
      if (debouncedKeyword?.trim()) {
        const q = debouncedKeyword.toLowerCase();
        filtered = filtered.filter((x) => (x.title || "").toLowerCase().includes(q));
      }

      setItems(filtered);
      setTotalPages(meta?.pages ?? 0);
    } finally {
      setLoading(false);
    }
  }

  // Reset về trang 0 khi đổi filter sau khi đã debounce
  useEffect(() => { setPage(0); }, [debouncedKeyword, published]);

  // Tải dữ liệu khi page/filters đã ổn định (đã debounce)
  useEffect(() => { load(page); }, [page, debouncedKeyword, published]);

  return (
    <div className="flex">
      {/* <AdminSidebar /> */}
      <div className="p-4 w-full space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Quản lý bài viết</h1>
          <Button asChild><Link href="/admin/content/posts/new">Tạo bài</Link></Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Bộ lọc</CardTitle></CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-2">
            <Input
              placeholder="Tìm theo tiêu đề..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select value={published} onValueChange={setPublished}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Đã publish</SelectItem>
                <SelectItem value="false">Nháp</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setKeyword(""); setPublished("all"); }}>
              Xóa lọc
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Danh sách</CardTitle></CardHeader>
          <CardContent>
            {loading ? "Đang tải..." : (
              <>
                <div className="grid gap-2 mb-4">
                  {items?.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.slug || "(chưa có slug)"} • {p.published ? "Đã publish" : "Nháp"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline">
                          <Link href={`/admin/content/posts/${p.id}/edit`}>Sửa</Link>
                        </Button>
                        {p.published ? (
                          <Button
                            variant="secondary"
                            onClick={async () => { await adminUnpublishPost(p.id); await load(); }}
                          >
                            Unpublish
                          </Button>
                        ) : (
                          <Button onClick={async () => { await adminPublishPost(p.id); await load(); }}>
                            Publish
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (confirm("Xóa bài viết?")) { await adminDeletePost(p.id); await load(); }
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
