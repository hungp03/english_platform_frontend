"use client";
import { useEffect, useState } from "react";
// import AdminSidebar from "@/components/common/AdminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  adminForumListCategories,
  adminForumCreateCategory,
  adminForumUpdateCategory,
  adminForumDeleteCategory,
} from "@/lib/api/forum/forum";

export default function AdminForumCategoriesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  async function load() { setItems(await adminForumListCategories()); }
  useEffect(() => { load(); }, []);

  async function save() {
    if (editingId) {
      await adminForumUpdateCategory(editingId, form);
      setEditingId(null);
    } else {
      await adminForumCreateCategory(form);
    }
    setForm({ name: "", slug: "", description: "" });
    await load();
  }

  return (
    <div className="flex">
      {/* <AdminSidebar /> */}
      <div className="p-4 w-full space-y-4">
        <h1 className="text-2xl font-semibold">Forum • Danh mục</h1>

        <Card>
          <CardHeader><CardTitle>{editingId ? "Sửa danh mục" : "Thêm danh mục"}</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <Input placeholder="Tên" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
            <Input placeholder="Slug (tùy chọn)" value={form.slug} onChange={(e)=>setForm({...form, slug:e.target.value})} />
            <Input placeholder="Mô tả" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} />
            <div className="flex gap-2">
              <Button onClick={save}>{editingId ? "Cập nhật" : "Thêm"}</Button>
              {editingId && <Button variant="secondary" onClick={()=>{setEditingId(null); setForm({ name:"", slug:"", description:""});}}>Hủy</Button>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Danh sách</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {items.map(c => (
              <div key={c.id} className="border rounded-md p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.slug}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={()=>{setEditingId(c.id); setForm({ name:c.name, slug:c.slug, description:c.description||""});}}>Sửa</Button>
                  <Button variant="destructive" onClick={async()=>{ if(confirm("Xóa?")) { await adminForumDeleteCategory(c.id); await load(); } }}>Xóa</Button>
                </div>
              </div>
            ))}
            {items.length===0 && <div className="text-sm text-muted-foreground">Chưa có danh mục</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
