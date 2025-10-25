"use client";
import React, { useEffect, useState } from "react";
// import AdminSidebar from "@/components/common/AdminSidebar";
import CategoryForm from "@/components/content/category-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  listCategories,
  createCategory,
  deleteCategory,
} from "@/lib/api/content/categories";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await listCategories();
      console.log("API response categories:", response);

      let categories = [];

      // ✅ Lấy từ data.result
      if (Array.isArray(response?.data?.result)) {
        categories = response.data.result;
      } else if (Array.isArray(response?.data?.content)) {
        categories = response.data.content;
      } else if (Array.isArray(response?.data)) {
        categories = response.data;
      } else if (Array.isArray(response?.content)) {
        categories = response.content;
      } else if (Array.isArray(response)) {
        categories = response;
      }

      setItems(categories);
    } catch (err) {
      console.error("Lỗi load categories:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(payload) {
    setCreating(true);
    try {
      await createCategory(payload);
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Xóa danh mục?")) return;
    await deleteCategory(id);
    await load();
  }

  return (
    <div className="flex">
      {/* <AdminSidebar /> */}
      <div className="p-4 w-full space-y-4">
        <h1 className="text-2xl font-semibold">Quản lý danh mục</h1>

        <Card>
          <CardHeader>
            <CardTitle>Tạo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm onSubmit={onCreate} submitting={creating} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              "Đang tải..."
            ) : (
              <div className="grid gap-2">
                {items?.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.slug}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => onDelete(c.id)}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
