import { memo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2 } from "lucide-react";
import Timer from "./timer";

const QuizHeader = memo(function QuizHeader({ quiz, onSubmit, submitting, startTime }) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            {quiz.description && (
              <p className="text-sm text-muted-foreground">{quiz.description}</p>
            )}
            <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Hướng dẫn làm bài:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Đọc kỹ câu hỏi và chọn đáp án phù hợp nhất</li>
                <li>Sử dụng nút "Trước" và "Tiếp theo" để di chuyển giữa các câu</li>
                <li>Nhấn "Nộp bài" khi hoàn thành để xem kết quả</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              {quiz.quizTypeName && (
                <Badge variant="secondary">{quiz.quizTypeName}</Badge>
              )}
              {quiz.skill && <Badge variant="outline">{quiz.skill}</Badge>}
              {quiz.quizSectionName && (
                <Badge variant="outline">{quiz.quizSectionName}</Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 items-end">
            {startTime && <Timer startTime={startTime} isActive={!submitting} />}
            <Button onClick={onSubmit} size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang nộp bài...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Nộp bài
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
});

export default QuizHeader;
