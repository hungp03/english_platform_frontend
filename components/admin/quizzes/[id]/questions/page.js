
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import Editor from "@/components/content/editor";
import Link from "next/link";
import { getQuiz, updateQuiz } from "@/lib/api/quiz/quiz";
import { listQuestionsByQuiz, deleteQuestion } from "@/lib/api/quiz/question";
import { toast } from "sonner";

// Avoid SSR issues
const AdminSidebar = dynamic(() => import("@/components/common/AdminSidebar"), { ssr: false });

export default function QuizQuestionsWithContextPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [contextText, setContextText] = useState("");
  const [quizTitle, setQuizTitle] = useState("");

  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function loadAll(p = page) {
    try {
      setLoading(true);
      setError(null);
      // 1) quiz detail
      const q = await getQuiz(quizId);
      const qd = q?.data || q;
      setQuizTitle(qd?.title || "Quiz");
      setContextText(qd?.contextText || "");

      // 2) questions
      const r = await listQuestionsByQuiz(quizId, { page: p, pageSize: 20 });
      const data = r?.data || r;
      setQuestions(data?.result || data?.items || []);
      const tp = data?.meta?.pages || data?.totalPages || 1;
      setTotalPages(tp);
      setPage(data?.meta?.page || p);
    } catch (e) {
      setError(e?.message || "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (quizId) loadAll(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  async function saveContext() {
    try {
      setSaving(true);
      await updateQuiz(quizId, { contextText });
      toast.success("Đã lưu đoạn văn/ngữ cảnh (contextText).");
    } catch (e) {
      toast.error(e?.message || "Lỗi khi lưu contextText");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteQuestion(id) {
    if (!confirm("Xóa câu hỏi này?")) return;
    try {
      await deleteQuestion(id);
      toast.success("Đã xóa câu hỏi.");
      loadAll(page);
    } catch (e) {
      toast.error(e?.message || "Không xóa được câu hỏi.");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Câu hỏi • {quizTitle}</h1>
          <div className="flex gap-2">
            <Link href="/admin/quizzes"><Button variant="outline">Quay lại</Button></Link>
            <Link href={`/admin/questions/new?quizId=${quizId}`}><Button>+ Thêm câu hỏi</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: ContextText with Editor.js */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Đoạn văn/Ngữ cảnh chung (contextText)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>🔄 Đang tải...</div>
              ) : (
                <>
                  <Editor
                    initialContent={contextText}
                    onContentChange={setContextText}
                  />
                  <div className="mt-4 flex gap-2">
                    <Button onClick={saveContext} disabled={saving}>
                      {saving ? "Đang lưu..." : "Lưu contextText"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    * Trình soạn thảo tái sử dụng Editor.js từ module bài viết để đảm bảo tính nhất quán.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* RIGHT: Questions list */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách câu hỏi</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>🔄 Đang tải...</div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : !questions || questions.length === 0 ? (
                <div className="text-gray-500 italic">Chưa có câu hỏi.</div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={q.id || idx} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Câu {q.orderIndex ?? idx + 1}</div>
                        <div className="flex gap-2">
                          <Link href={`/admin/questions/${q.id}?quizId=${quizId}`}>
                            <Button size="sm" variant="outline">Sửa</Button>
                          </Link>
                          <Button size="sm" variant="destructive" onClick={()=>onDeleteQuestion(q.id)}>
                            Xóa
                          </Button>
                        </div>
                      </div>
                      {/* Render question stem/preview (HTML) if available */}
                      {q.content ? (
                        <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: q.content }} />
                      ) : (
                        <div className="text-sm text-muted-foreground mt-2">— Không có nội dung hiển thị —</div>
                      )}
                      {/* Render options */}
                      {q.options && q.options.length > 0 && (
                        <ul className="mt-2 list-disc pl-5 space-y-1">
                          {q.options.sort((a,b)=>(a.orderIndex||0)-(b.orderIndex||0)).map((opt, i) => (
                            <li key={opt.id || i} className={opt.correct ? "font-medium" : ""}>
                              {opt.content}
                              {opt.correct ? " ✅" : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  <div className="pt-2">
                    <Pagination currentPage={Math.max(0, page - 1)} totalPages={totalPages} onPageChange={(p)=> { setPage(p+1); loadAll(p+1); }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
