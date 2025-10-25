"use client";
import React, { useEffect, useState } from "react";
import { publicListPostsPaged } from "@/lib/api/content/posts";
import { listCategories } from "@/lib/api/content/categories";
import PostCard from "@/components/content/post-card";
import FiltersBar from "@/components/content/filters-bar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import useDebouncedValue from "@/hooks/useDebouncedValue";

export default function BlogIndexPage() {
  const [posts, setPosts] = useState([]);
  const [cats, setCats] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  // Debounce toàn bộ object filter (keyword, category, …) bằng stringify
  const filterKey = JSON.stringify(filters);
  const debouncedFilterKey = useDebouncedValue(filterKey, 1500);

  // Pagination (0-based)
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState(0);

  async function load(p = page, key = debouncedFilterKey) {
    setLoading(true);
    try {
      const parsedFilters = key ? JSON.parse(key) : {};
      const [catsData, paged] = await Promise.all([
        listCategories(),
        publicListPostsPaged({ ...parsedFilters, page: p + 1, pageSize }),
      ]);
      setCats(catsData);
      setPosts(paged.items);
      setTotalPages(paged.meta?.pages ?? 0);
    } finally {
      setLoading(false);
    }
  }

  // Reset về trang 0 sau khi filter đã debounce xong
  useEffect(() => { setPage(0); }, [debouncedFilterKey]);

  // Gọi API khi page hoặc filter (đã debounce) thay đổi
  useEffect(() => { load(page, debouncedFilterKey); }, [page, debouncedFilterKey]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">Bài viết</h1>

      <Card>
        <CardHeader><CardTitle>Bộ lọc</CardTitle></CardHeader>
        <CardContent>
          <FiltersBar categories={cats} onChange={setFilters} initial={filters} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danh sách</CardTitle></CardHeader>
        <CardContent>
          {loading ? "Đang tải..." : (
            <>
              <div className="grid gap-3 md:grid-cols-2 mb-4">
                {posts?.map((p) => <PostCard key={p.id} post={p} />)}
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
  );
}
