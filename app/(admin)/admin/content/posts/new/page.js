"use client";
import React, { useEffect, useState } from "react";
// import AdminSidebar from "@/components/common/AdminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PostForm from "@/components/content/post-form";
import { listCategories } from "@/lib/api/content/categories";
import { adminCreatePost } from "@/lib/api/content/posts";
import { useRouter } from "next/navigation";

export default function AdminPostNewPage() {
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const data = await listCategories();
      const content = data?.content ?? data?.data ?? data;
      setCategories(Array.isArray(content) ? content : []);
    })();
  }, []);

  async function create(payload) {
    setSaving(true);
    try {
      await adminCreatePost(payload);
      router.push("/admin/content/posts");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex">
      {/* <AdminSidebar /> */}
      <div className="p-4 w-full space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tạo bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            <PostForm
              categories={categories}
              onSubmit={create}
              submitting={saving}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
