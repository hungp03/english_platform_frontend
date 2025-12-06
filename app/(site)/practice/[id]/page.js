"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getPublicQuiz } from "@/lib/api/quiz/quiz";
import { submitOneShot, submitSpeaking, getSpeakingResults, submitWriting, getWritingResults, getAttemptAnswers } from "@/lib/api/attempt";
import ContextPassage from "@/components/practice/context-passage";
import QuizHeader from "@/components/practice/quiz-header";
import QuestionCard from "@/components/practice/question-card";
import AssessmentPolling from "@/components/practice/assessment-polling";

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [audioBlobs, setAudioBlobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const startTimeRef = useRef(null);

  // Assessment states
  const [attemptId, setAttemptId] = useState(null);
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [assessmentError, setAssessmentError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // State cho warning dialog
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const answered = useMemo(() => Object.keys(answers).length, [answers]);

  // Load đề (PUBLIC)
  useEffect(() => {
    let mounted = true;
    // Chỉ set startTime một lần duy nhất cho mỗi quiz (tránh bị reset khi rerender)
    if (!startTimeRef.current || startTimeRef.current.quizId !== id) {
      const now = Date.now();
      startTimeRef.current = { quizId: id, time: now };
      setStartTime(now);
    }
    
    setLoading(true);
    (async () => {
      try {
        const res = await getPublicQuiz(String(id));
        const data = res?.data || res;
        if (!mounted) return;
        setQuiz(data || null);

        // an toàn: sort theo orderIndex nếu có
        const qs = Array.isArray(data?.questions) ? [...data.questions] : [];
        qs.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        setQuestions(qs);

        setIndex(0);
        setAnswers({});
        setError("");
      } catch (e) {
        console.error(e);
        if (mounted) setError("Không tải được đề thi.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const total = questions.length;
  const current = useMemo(() => questions?.[index] || null, [questions, index]);
  const isMCQ = useCallback((q) => Array.isArray(q?.options) && q.options.length > 0, []);
  const isSpeaking = useCallback((q) => quiz?.skill?.toUpperCase() === "SPEAKING" && !isMCQ(q), [quiz?.skill, isMCQ]);

  const go = useCallback((step) => {
    setIndex((prev) => {
      const next = prev + step;
      if (next < 0) return 0;
      if (next >= total) return total - 1;
      return next;
    });
  }, [total]);

  const onChoose = useCallback((qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }, []);

  const onAudioReady = useCallback((qid, blob) => {
    setAudioBlobs((prev) => ({ ...prev, [qid]: blob }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      setWarningDialogOpen(false);

      const payloadAnswers = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: isMCQ(q) ? answers[q.id] ?? null : null,
        answerText: !isMCQ(q) && !isSpeaking(q) ? answers[q.id] ?? null : null,
      }));

      const completionTimeSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const startedAt = startTime ? new Date(startTime).toISOString() : undefined;

      const res = await submitOneShot({
        quizId: String(id),
        answers: payloadAnswers,
        completionTimeSeconds,
        ...(startedAt && { startedAt }),
      });

      if (res.success) {
        const data = res.data;
        const newAttemptId = data?.id;
        const attemptAnswers = data?.answers || [];
        setAttemptId(newAttemptId);

        const skill = quiz?.skill?.toUpperCase();
        const hasSpeakingOrWriting = skill === 'SPEAKING' || skill === 'WRITING';

        if (hasSpeakingOrWriting && newAttemptId && attemptAnswers.length > 0) {
          setAssessmentMode(true);
          setIsPolling(true);
          
          const assessmentPromises = [];
          const assessmentQuestions = questions.filter(q => 
            (skill === 'SPEAKING' && !isMCQ(q)) || (skill === 'WRITING' && !isMCQ(q))
          );
          const totalAssessments = assessmentQuestions.length;
          
          for (const q of questions) {
            const answer = attemptAnswers.find(a => a.questionId === q.id);
            if (!answer) continue;
            
            const answerId = answer.answerId || answer.id;
            
            if (skill === 'SPEAKING' && !isMCQ(q)) {
              const audioBlob = audioBlobs[q.id];
              if (audioBlob) {
                assessmentPromises.push(
                  (async () => {
                    try {
                      const speakingRes = await submitSpeaking(newAttemptId, answerId, audioBlob);
                      if (speakingRes.success && speakingRes.data?.id) {
                        return pollSpeakingResult(speakingRes.data.id, q, totalAssessments);
                      }
                    } catch (err) {
                      console.error('Speaking assessment error:', err);
                      return null;
                    }
                  })()
                );
              }
            } else if (skill === 'WRITING' && !isMCQ(q)) {
              const answerText = answers[q.id];
              if (answerText && answerText.trim()) {
                assessmentPromises.push(
                  (async () => {
                    try {
                      const writingRes = await submitWriting(newAttemptId, answerId);
                      if (writingRes.success && writingRes.data?.id) {
                        return pollWritingResult(writingRes.data.id, q, totalAssessments);
                      }
                    } catch (err) {
                      console.error('Writing assessment error:', err);
                      return null;
                    }
                  })()
                );
              }
            }
          }
          
          const results = await Promise.all(assessmentPromises);
          setAllResults(results.filter(r => r !== null));
          setIsPolling(false);
        } else {
          const answersRes = await getAttemptAnswers(newAttemptId);
          if (answersRes.success) {
            setAssessmentMode(true);
            setAllResults([{ type: 'mcq', data: answersRes.data }]);
          }
        }
      } else {
        setWarningMessage(res.error || "Nộp bài thất bại. Vui lòng thử lại.");
        setWarningDialogOpen(true);
      }
    } catch (e) {
      console.error("Submit failed:", e);
      setWarningMessage("Nộp bài thất bại. Vui lòng thử lại.");
      setWarningDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  }, [id, questions, startTime, quiz, answers, audioBlobs, isMCQ, isSpeaking]);

  const onSubmit = useCallback(async () => {
    const skill = quiz?.skill?.toUpperCase();
    const isAssessmentQuiz = skill === 'SPEAKING' || skill === 'WRITING';
    
    if (isAssessmentQuiz && answered < total) {
      setWarningMessage(
        `Bạn phải hoàn thành tất cả ${total} câu hỏi trước khi nộp bài.`
      );
      setWarningDialogOpen(true);
      return;
    }
    
    if (!isAssessmentQuiz && answered < total) {
      setWarningMessage(
        `Bạn mới trả lời ${answered}/${total} câu. Vẫn nộp bài?`
      );
      setWarningDialogOpen(true);
      return;
    }

    await handleSubmit();
  }, [quiz, answered, total, handleSubmit]);

  const pollSpeakingResult = async (submissionId, question, totalQuestions) => {
    const maxAttempts = 40;
    const pollInterval = Math.min(3000 + (totalQuestions - 1) * 1000, 10000);
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const res = await getSpeakingResults(submissionId);
        if (res?.success && res.data?.aiScore !== null) {
          return { ...res.data, questionId: question.id, questionContent: question.content, type: 'speaking' };
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (err) {
        console.error('Poll speaking error:', err);
      }
    }
    return { timeout: true, questionId: question.id, questionContent: question.content, type: 'speaking' };
  };

  const pollWritingResult = async (submissionId, question, totalQuestions) => {
    const maxAttempts = 40;
    const pollInterval = Math.min(3000 + (totalQuestions - 1) * 1000, 10000);
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const res = await getWritingResults(submissionId);
        if (res?.success && res.data?.aiScore !== null) {
          return { ...res.data, questionId: question.id, questionContent: question.content, type: 'writing' };
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (err) {
        console.error('Poll writing error:', err);
      }
    }
    return { timeout: true, questionId: question.id, questionContent: question.content, type: 'writing' };
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
        <Skeleton className="h-9 w-28" />
        
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24 rounded" />
                  <Skeleton className="h-6 w-20 rounded" />
                  <Skeleton className="h-6 w-28 rounded" />
                </div>
              </div>
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-5xl p-4 sm:p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <p className="text-destructive text-lg font-medium">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.back()}
              >
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto max-w-5xl p-4 sm:p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Không tìm thấy đề thi.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.back()}
              >
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="container mx-auto max-w-5xl p-4 sm:p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Đề thi chưa có câu hỏi nào.</p>
              <p className="text-sm mt-2">Vui lòng quay lại sau.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.back()}
              >
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      {/* Assessment Results */}
      {assessmentMode && (
        <AssessmentPolling
          isPolling={isPolling}
          allResults={allResults}
          assessmentError={assessmentError}
          attemptId={attemptId}
          quizId={id}
          onViewDetails={(id) => router.push(id ? `/account/attempts/${id}` : '/account')}
        />
      )}

      {!assessmentMode && (
        <>
          {/* Header */}
          <QuizHeader quiz={quiz} onSubmit={onSubmit} submitting={submitting} startTime={startTime} />

          {/* Passage */}
          <ContextPassage contextText={quiz.contextText} />

          {/* Question */}
          <QuestionCard
            current={current}
            index={index}
            total={total}
            answered={answered}
            answers={answers}
            isMCQ={isMCQ}
            isSpeaking={isSpeaking}
            onChoose={onChoose}
            onAudioReady={onAudioReady}
            onNavigate={go}
          />

          {/* Warning dialog */}
      <AlertDialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thông báo</AlertDialogTitle>
            <AlertDialogDescription>
              {warningMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {warningMessage.includes("Vẫn nộp bài") ? (
              <>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Nộp bài"}
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={() => setWarningDialogOpen(false)}>
                Đồng ý
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </>
      )}
    </div>
  );
}