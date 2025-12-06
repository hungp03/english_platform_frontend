"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { listPublicQuizTypes } from "@/lib/api/quiz/quiz-type";

const QuizTypeCard = memo(({ quizType }) => (
  <Link href={`/mock-tests/${quizType.id}/sections`} className="h-full">
    <Card className="h-full cursor-pointer hover:shadow-lg transition-all border border-muted/50">
      <CardHeader>
        <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-semibold">{quizType.name}</CardTitle>
        {quizType.description && <p className="text-sm text-muted-foreground">{quizType.description}</p>}
      </CardHeader>
    </Card>
  </Link>
));

QuizTypeCard.displayName = "QuizTypeCard";

const LoadingSkeleton = memo(() => (
  <div className="container mx-auto p-6">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="border border-muted/50">
          <CardHeader>
            <Skeleton className="w-12 h-12 rounded-lg mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
        </Card>
      ))}
    </div>
  </div>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

export default function QuizTypes() {
  const [quizTypes, setQuizTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQuizTypes = useCallback(async () => {
    try {
      const r = await listPublicQuizTypes();
      setQuizTypes(r?.data || r || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizTypes();
  }, [loadQuizTypes]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-3 mb-6">
        <h1 className="text-2xl font-semibold">Các loại bài luyện tập</h1>
        <p className="text-muted-foreground max-w-3xl">
          Chọn loại bài luyện tập phù hợp với mục tiêu của bạn. Chúng tôi cung cấp đa dạng các bài luyện tập 
          từ IELTS, TOEIC đến các bài kiểm tra tiếng Anh cơ bản, giúp bạn rèn luyện và đánh giá năng lực một cách toàn diện.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quizTypes.map((qt) => (
          <QuizTypeCard key={qt.id} quizType={qt} />
        ))}
      </div>
    </div>
  );
}
