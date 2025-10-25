"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { listQuizTypes } from "@/lib/api/quiz/quiz-type";

export default function QuizTypes() {
  const [quizTypes, setQuizTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async()=>{
      try {
        const r = await listQuizTypes();
        setQuizTypes(r?.data || r || []);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Các loại bài thi</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quizTypes.map((qt) => (
          <Link key={qt.id} href={`/quiz/types/${qt.id}`}>
            <Card className="cursor-pointer hover:shadow-lg transition-all border border-muted/50">
              <CardHeader>
                <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-semibold">{qt.name}</CardTitle>
                {qt.description && <p className="text-sm text-muted-foreground">{qt.description}</p>}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
