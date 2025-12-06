"use client";

import { useMemo } from "react";
import { CheckCircle, XCircle, Calendar, Clock, Lightbulb } from "lucide-react"; // [New] Thêm icon Lightbulb
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AttemptAnswersView({ data }) {
  if (!data) return null;

  const {
    quizName,
    quizType,
    quizSection,
    skill,
    status,
    totalQuestions,
    totalCorrect,
    score,
    maxScore,
    startedAt,
    submittedAt,
    completionTimeSeconds,
    contextText,
    explanation,
    answers,
  } = data;

  const pct = useMemo(() => {
    if (!score || !maxScore) return "-";
    return Math.round((score / maxScore) * 100) + "%";
  }, [score, maxScore]);

  const fmt = (iso) => {
    try {
      return iso ? new Date(iso).toLocaleString("vi-VN") : "";
    } catch {
      return "";
    }
  };

  const getStatusVariant = (status) => {
    if (status === "COMPLETED") return "default";
    if (status === "IN_PROGRESS") return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{quizName}</CardTitle>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>{quizType}</span>
                <span>•</span>
                <span>{quizSection}</span>
                <span>•</span>
                <span>{skill}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusVariant(status)}>{status}</Badge>
              <Badge variant="secondary">
                {totalCorrect ?? "-"} / {totalQuestions ?? "-"}
              </Badge>
              <Badge variant="default">{pct}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Bắt đầu: {fmt(startedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Nộp bài: {fmt(submittedAt)}</span>
            </div>
            {completionTimeSeconds !== null && completionTimeSeconds !== undefined && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Thời gian: {completionTimeSeconds}s</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Context Text for entire attempt */}
      {contextText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đoạn văn</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: contextText }}
            />
          </CardContent>
        </Card>
      )}

      {/* Explanation for entire attempt */}
      {explanation && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg text-amber-900">Giải thích chung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-900 whitespace-pre-wrap">{explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Answers */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Câu hỏi và đáp án</h2>
        {answers?.map((a, idx) => (
          <Card
            key={a.questionId || idx}
            className={`shadow-sm ${
              a.isCorrect
                ? "border-green-200 bg-green-50/30"
                : "border-red-200 bg-red-50/30"
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="font-medium">
                      Câu {a.orderIndex ?? idx + 1}
                    </Badge>
                    {a.isCorrect ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Đúng
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Sai
                      </Badge>
                    )}
                  </div>
                  <p className="text-base text-foreground whitespace-pre-wrap">
                    {a.questionContent}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Explanation for this question */}
              {a.explanation && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">Giải thích:</span>
                  </div>
                  <p className="text-sm text-amber-900 whitespace-pre-wrap">{a.explanation}</p>
                </div>
              )}

              {/* Options */}
              {Array.isArray(a.options) && a.options.length > 0 && (
                <div className="space-y-2">
                  {a.options.map((o) => {
                    const isSelected = !!o.selected;
                    const isCorrect = !!o.correct;

                    return (
                      <div
                        key={o.id}
                        className={`rounded-lg border p-3 transition-colors ${
                          isCorrect
                            ? "border-green-400 bg-green-50"
                            : "border-gray-200 bg-background"
                        } ${isSelected ? "ring-2 ring-primary" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">{o.content}</p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {isCorrect && (
                                <Badge
                                  variant="default"
                                  className="text-xs bg-green-600"
                                >
                                  Đáp án đúng
                                </Badge>
                              )}
                              {isSelected && (
                                <Badge variant="secondary" className="text-xs">
                                  Bạn đã chọn
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            
          </Card>
        ))}
      </div>
    </div>
  );
}