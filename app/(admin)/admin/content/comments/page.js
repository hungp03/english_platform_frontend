"use client";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
// import AdminSidebar from "@/components/common/AdminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import {
  adminListAllCommentsPaged,
  adminHideComment,
  adminUnhideComment,
  adminDeleteComment,
} from "@/lib/api/content/comments";

export default function AdminCommentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, 1500);
  const [published, setPublished] = useState("all"); // "all" | "true" | "false"

  // Pagination (0-based UI)
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState(0);

  async function load(p = page) {
    setLoading(true);
    try {
      const params = {
        page: p + 1, // backend 1-based
        pageSize,
        keyword: debouncedKeyword,
      };
      if (published !== "all") params.published = published === "true";

      const { items, meta } = await adminListAllCommentsPaged(params);

      // Nếu BE chưa lọc theo published/keyword, vẫn đảm bảo kết quả chuẩn ở FE
      let list = items;
      if (published !== "all") {
        const expect = published === "true";
        list = list.filter((c) => {
          const flag = c.published ?? c.isPublished ?? c.is_published ?? true;
          return flag === expect;
        });
      }
      if (debouncedKeyword?.trim()) {
        const q = debouncedKeyword.toLowerCase();
        list = list.filter(
          (c) =>
            (c.bodyMd || "").toLowerCase().includes(q) ||
            (c.id || "").toLowerCase().includes(q) ||
            (c.postId || "").toLowerCase().includes(q) ||
            (c.postTitle || "").toLowerCase().includes(q) ||
            (c.postSlug || "").toLowerCase().includes(q) ||
            (c.authorName || c.author?.fullName || c.author?.name || "Ẩn danh")
              .toLowerCase()
              .includes(q)
        );
      }

      setItems(list);
      setTotalPages(meta?.pages ?? 0);
    } finally {
      setLoading(false);
    }
  }

  // Reset về trang 0 khi filter đổi (sau debounce)
  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, published]);

  // Gọi load khi page/filter đổi
  useEffect(() => {
    load(page);
  }, [page, debouncedKeyword, published]);

  const renderAvatar = (c) => {
    const name =
      c.author?.fullName || c.author?.name || c.authorName || "Ẩn danh";
    const avatar = c.author?.avatarUrl || c.author?.avatar || c?.authorAvatarUrl || null;
    if (avatar) {
      return (
        <img
          src={avatar}
          alt={name}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center text-xs font-semibold">
        {name?.charAt(0)?.toUpperCase() || "?"}
      </div>
    );
  };

  return (
    <div className="flex">
      {/* <AdminSidebar /> */}
      <div className="p-4 w-full space-y-4">
        <h1 className="text-2xl font-semibold">Quản lý bình luận</h1>

        {/* Bộ lọc */}
        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-2">
            <Input
              placeholder="Tìm theo nội dung / ID / post / tác giả…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select value={published} onValueChange={setPublished}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Đang hiển thị</SelectItem>
                <SelectItem value="false">Đã ẩn</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setKeyword("");
                setPublished("all");
              }}
            >
              Xóa lọc
            </Button>
          </CardContent>
        </Card>

        {/* Danh sách */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Danh sách bình luận</CardTitle>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              "Đang tải..."
            ) : (
              <div className="grid gap-3">
                {items?.map((c) => {
                  const isPublished =
                    c.published ?? c.isPublished ?? c.is_published ?? true;
                  const authorName =
                    c.author?.fullName ||
                    c.author?.name ||
                    c.authorName ||
                    "Ẩn danh";
                  return (
                    <div key={c.id} className="border rounded-md p-3">
                      <div className="flex items-start gap-3">
                        {renderAvatar(c)}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>ID: {c.id}</span>
                            {c.postId && <span>• postId: {c.postId}</span>}
                            {c.postSlug && <span>• slug: {c.postSlug}</span>}
                            {c.createdAt && (
                              <span>
                                • {new Date(c.createdAt).toLocaleString()}
                              </span>
                            )}
                            <span>• {isPublished ? "Hiển thị" : "Đã ẩn"}</span>
                          </div>
                          <div className="mt-1 font-medium">{authorName}</div>
                          <div className="mt-1 whitespace-pre-wrap">
                            {c.bodyMd}
                          </div>
                          <div className="mt-2 flex gap-2">
                            {isPublished ? (
                              <Button
                                variant="secondary"
                                onClick={async () => {
                                  await adminHideComment(c.id);
                                  await load();
                                }}
                              >
                                Ẩn
                              </Button>
                            ) : (
                              <Button
                                onClick={async () => {
                                  await adminUnhideComment(c.id);
                                  await load();
                                }}
                              >
                                Hiện
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              onClick={async () => {
                                if (confirm("Xóa comment?")) {
                                  await adminDeleteComment(c.id);
                                  await load();
                                }
                              }}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}