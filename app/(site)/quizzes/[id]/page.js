"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicQuiz } from "@/lib/api/quiz/quiz";
import { toast } from "sonner";

export default function QuizDetailPage(){
  const params = useParams();
  const id = params?.id;
  const [quiz, setQuiz] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const d = await getPublicQuiz(id);
        setQuiz(d);
      } catch (e) {
        console.error(e);
        toast.error("Cannot load quiz (must be PUBLISHED)");
      }
    })();
  }, [id]);

  if (!quiz) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">{quiz.title}</h1>
      {quiz.contextText && <div className="prose" dangerouslySetInnerHTML={{ __html: quiz.contextText }} />}
      {quiz.questionText && <div className="border p-3 rounded-lg">{quiz.questionText}</div>}
      <div className="text-sm text-muted-foreground">Total attempts: {quiz.attemptCount ?? 0}</div>
    </div>
  );
}