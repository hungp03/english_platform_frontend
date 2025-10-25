"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { listQuizTypes } from "@/lib/api/quiz/quiz-type";
import { searchQuizzes, deleteQuiz, updateQuiz } from "@/lib/api/quiz/quiz";
import { toast } from "sonner";

// Tải Sidebar động để tránh lỗi SSR ở Codesandbox
// const AdminSidebar = dynamic(() => import("@/components/common/AdminSidebar"), { ssr: false });

const STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const SKILLS = ["LISTENING","READING","SPEAKING","WRITING"];

export default function AdminQuizzesPage() {
  const [keyword, setKeyword] = useState("");
  const [quizTypeId, setQuizTypeId] = useState("");
  const [status, setStatus] = useState("");
  const [skill, setSkill] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await listQuizTypes();
        setTypes(r?.data || r || []);
      } catch (err) {
        console.error(err);
        setError("Không thể tải loại đề thi.");
      }
    })();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await searchQuizzes({
        page, pageSize,
        keyword: keyword || "",
        quizTypeId: quizTypeId || null,
        status: status || null,
        skill: skill || null
      });
      const meta = res?.meta || res?.data?.meta;
      const result = res?.result || res?.data?.result;
      setItems(result || []);
      setTotalPages(meta?.pages || 0);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách quiz.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [page, pageSize]);

  const onSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const onDelete = async (id) => {
    if (!confirm("Xóa quiz này?")) return;
    try {
      await deleteQuiz(id);
      await load();
      toast.success("Đã xóa quiz");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa quiz");
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await updateQuiz(id, { status: nextStatus });
      await load();
      toast.success("Đã cập nhật trạng thái");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminSidebar /> */}

      <main className="flex-1 p-6 md:p-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Quản lí đề thi</h1>
          <Link href="/admin/quizzes/new"><Button>+ Tạo Quiz</Button></Link>
        </div>

        <Card className="mb-4">
          <CardHeader><CardTitle>Bộ lọc</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSearch} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input placeholder="Từ khóa" value={keyword} onChange={(e)=>setKeyword(e.target.value)} />
              <Select value={quizTypeId} onValueChange={setQuizTypeId}>
  <SelectTrigger><SelectValue placeholder="Quiz Type" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Tất cả</SelectItem>
    {types.map(t => (
      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
    ))}
  </SelectContent>
</Select>

<Select value={status} onValueChange={setStatus}>
  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Tất cả</SelectItem>
    {STATUS.map(s => (
      <SelectItem key={s} value={s}>{s}</SelectItem>
    ))}
  </SelectContent>
</Select>

<Select value={skill} onValueChange={setSkill}>
  <SelectTrigger><SelectValue placeholder="Skill" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Tất cả</SelectItem>
    {SKILLS.map(s => (
      <SelectItem key={s} value={s}>{s}</SelectItem>
    ))}
  </SelectContent>
</Select>

              <Button type="submit">Tìm kiếm</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Kết quả</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div>🔄 Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : items.length === 0 ? (
              <div className="text-gray-500 italic">Không có kết quả nào.</div>
            ) : (
              <>
                <div className="space-y-2">
                  {items.map(it => (
                    <div key={it.id} className="flex items-center justify-between border rounded p-3">
                      <div>
                        <div className="font-medium">{it.title}</div>
                        <div className="text-xs text-muted-foreground">{it.quizTypeName} • {it.status} • {it.skill}</div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Link href={`/admin/quizzes/${it.id}`}><Button size="sm" variant="outline">Sửa</Button></Link>
                        <Button size="sm" variant="destructive" onClick={()=>onDelete(it.id)}>Xóa</Button>
                        <Link href={`/admin/quizzes/${it.id}/questions`}><Button size="sm" variant="secondary">Câu hỏi</Button></Link>
                        <Select value={it.status} onValueChange={(v)=>handleStatusChange(it.id, v)}>
                          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">DRAFT</SelectItem>
                            <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                            <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Pagination currentPage={Math.max(0, page - 1)} totalPages={totalPages} onPageChange={(p)=> setPage(p+1)} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}