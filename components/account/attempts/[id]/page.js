"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import AttemptAnswersView from "@/components/assessment/attempt-answers-view";
import { getAttemptAnswers } from "@/lib/api/attempt";
import { useParams } from "next/navigation";

export default function AttemptDetailPage({ params }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAttemptAnswers(id);
        if (mounted) {
          if (res.success) {
            setData(res.data);
          } else {
            setError(res.error || "Load thất bại");
          }
        }
      } catch (e) {
        if (mounted) setError(e?.message || "Load thất bại");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">{String(error)}</div>;
  if (!data) return <div className="p-6">Không có dữ liệu.</div>;

  const quizId = data?.quizId; // lấy quizId từ response

  return (
    <div className="container mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/account"
          className="inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Quay lại tài khoản
        </Link>

        {quizId && (
          <Link
            href={`/practice/${quizId}`}
            className="inline-flex items-center text-sm px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700"
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Làm lại bài
          </Link>
        )}
      </div>

      <AttemptAnswersView data={data} />
    </div>
  );
}
