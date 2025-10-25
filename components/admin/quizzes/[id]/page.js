"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import AdminSidebar from "@/components/common/AdminSidebar";
import { listQuizTypes } from "@/lib/api/quiz/quiz-type";
import { getQuiz, createQuiz, updateQuiz } from "@/lib/api/quiz/quiz";
import { toast } from "sonner";

const SKILLS = ["LISTENING", "READING", "SPEAKING", "WRITING"];
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export default function AdminQuizEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const isNew = id === "new";

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    quizTypeId: "",
    skill: "READING",
    status: "DRAFT",
    contextText: "",
    questionText: "",
    explanation: "",
  });

  // Load loại quiz + quiz data
  useEffect(() => {
    (async () => {
      try {
        const t = await listQuizTypes();
        setTypes(t?.data || t || []);
        if (!isNew) {
          const q = await getQuiz(id);
          const d = q?.data || q;
          setForm({
            title: d.title || "",
            description: d.description || "",
            quizTypeId: String(d.quizTypeId || ""),
            skill: d.skill || "READING",
            status: d.status || "DRAFT",
            contextText: d.contextText || "",
            questionText: d.questionText || "",
            explanation: d.explanation || "",
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Không tải được dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.title || !payload.quizTypeId) {
        toast.error("Vui lòng nhập tiêu đề và chọn loại đề");
        return;
      }
      if (isNew) await createQuiz(payload);
      else await updateQuiz(id, payload);
      toast.success("Đã lưu quiz thành công");
      router.push("/admin/quizzes");
    } catch (e) {
      console.error(e);
      toast.error("Lưu thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-6 text-muted-foreground">Đang tải...</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            {isNew ? "Tạo Quiz" : "Sửa Quiz"}
          </h1>
          <Link href="/admin/quizzes">
            <Button variant="outline">Quay lại</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Tiêu đề */}
              <Input
                placeholder="Tiêu đề"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              {/* Loại đề */}
              <Select
                value={form.quizTypeId}
                onValueChange={(v) => setForm({ ...form, quizTypeId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại đề" />
                </SelectTrigger>
                <SelectContent>
                  {types.length > 0 ? (
                    types.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled>Không có loại đề</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Trạng thái */}
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Kỹ năng */}
              <Select
                value={form.skill}
                onValueChange={(v) => setForm({ ...form, skill: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kỹ năng" />
                </SelectTrigger>
                <SelectContent>
                  {SKILLS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mô tả */}
              <div className="md:col-span-2">
                <Textarea
                  rows={4}
                  placeholder="Mô tả"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* contextText */}
              <div className="md:col-span-2">
                <Textarea
                  rows={4}
                  placeholder="Đoạn văn/Ngữ cảnh chung (contextText)"
                  value={form.contextText}
                  onChange={(e) =>
                    setForm({ ...form, contextText: e.target.value })
                  }
                />
              </div>

              {/* questionText */}
              <div className="md:col-span-2">
                <Textarea
                  rows={4}
                  placeholder="Yêu cầu Speaking/Writing (questionText)"
                  value={form.questionText}
                  onChange={(e) =>
                    setForm({ ...form, questionText: e.target.value })
                  }
                />
              </div>

              {/* explanation */}
              <div className="md:col-span-2">
                <Textarea
                  rows={4}
                  placeholder="Giải thích sau khi nộp (explanation)"
                  value={form.explanation}
                  onChange={(e) =>
                    setForm({ ...form, explanation: e.target.value })
                  }
                />
              </div>

              {/* Submit */}
              <div className="md:col-span-2">
                <Button type="submit" className="w-full md:w-auto">
                  {isNew ? "Tạo mới" : "Cập nhật"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
