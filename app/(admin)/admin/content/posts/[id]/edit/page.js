"use client";
import React, { useEffect, useState } from "react";
// import AdminSidebar from "@/components/common/AdminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PostForm from "@/components/content/post-form";
import { listCategories } from "@/lib/api/content/categories";
import { adminGetPost, adminUpdatePost } from "@/lib/api/content/posts";
import { useParams, useRouter } from "next/navigation";

export default function AdminPostEditPage() {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [initial, setInitial] = useState(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const cats = await listCategories();

      // Lấy đúng mảng categories ra
      let catsContent = [];
      if (Array.isArray(cats?.content)) {
        catsContent = cats.content;
      } else if (Array.isArray(cats?.data)) {
        catsContent = cats.data;
      } else if (Array.isArray(cats)) {
        catsContent = cats;
      } else if (Array.isArray(cats?.data?.result)) {
        // thêm trường hợp giống như posts
        catsContent = cats.data.result;
      }

      setCategories(catsContent);

      const post = await adminGetPost(id);
      setInitial(post);
    })();
  }, [id]);

  async function update(payload) {
    setSaving(true);
    try {
      await adminUpdatePost(id, payload);
      router.push("/admin/content/posts");
    } finally {
      setSaving(false);
    }
  }

  if (!initial)
    return (
      <div className="flex">
        {/* <AdminSidebar /> */}
        <div className="p-4">Đang tải...</div>
      </div>
    );

  return (
    <div className="flex">
      {/* <AdminSidebar /> */}
      <div className="p-4 w-full space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sửa bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            <PostForm
              initial={initial}
              categories={categories}
              onSubmit={update}
              submitting={saving}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
