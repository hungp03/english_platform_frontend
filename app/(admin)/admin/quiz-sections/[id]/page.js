"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getQuizSection, updateQuizSection } from "@/lib/api/quiz/quiz-section";
import QuizSectionForm from "@/components/quiz/quiz-section-form";
import { toast } from "sonner";

export default function EditQuizSectionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🧭 Fetch quiz section data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const d = await getQuizSection(id);
        
        setData({
          ...d,
          // Nếu API trả về giá trị hợp lệ thì dùng, không thì để undefined
          quizTypeId: d?.quizTypeId || undefined,
          skill: d?.skill || undefined,
          name: d?.name || "",
        });
      } catch (error) {
        console.error("❌ Load quiz section failed:", error);
        toast.error("Không thể tải dữ liệu phần thi");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 💾 Handle submit
  const onSubmit = async (payload) => {
    try {
      setSaving(true);
      await updateQuizSection(id, payload);
      toast.success("Cập nhật thành công!");
      router.push("/admin/quiz-sections");
    } catch (error) {
      console.error("❌ Update failed:", error);
      toast.error(error?.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // ⏳ UI states
  if (loading)
    return <div className="p-4 text-muted-foreground">Đang tải dữ liệu...</div>;

  if (!data)
    return <div className="p-4 text-destructive">Không tìm thấy dữ liệu phần thi.</div>;

  // ✅ Render main form
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Chỉnh sửa phần thi</h1>
      <QuizSectionForm
        key={data.id}
        initial={data}
        onSubmit={onSubmit}
        submitting={saving}
      />
    </div>
  );
}
