import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Clock } from "lucide-react";
import AssessmentResults from "./assessment-results";
import AttemptAnswersView from "@/components/assessment/attempt-answers-view";
import Link from "next/link";

export default function AssessmentPolling({
  isPolling,
  allResults,
  assessmentError,
  attemptId,
  onViewDetails,
  quizId,
  onRetrySuccess
}) {
  const timeoutResults = allResults.filter(r => r?.timeout);
  const successResults = allResults.filter(r => r && !r.timeout);
  const hasTimeout = timeoutResults.length > 0;

  return (
    <>
      {isPolling && (
        <Card className="shadow-lg border-blue-500">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Đang chấm điểm...</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  AI đang phân tích câu trả lời của bạn. Quá trình này có thể mất 30-60 giây.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Vui lòng không đóng trang này.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasTimeout && !isPolling && (
        <Card className="shadow-lg border-yellow-500">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Clock className="h-12 w-12 text-yellow-600" />
              <div>
                <h3 className="text-lg font-semibold">Chấm điểm đang xử lý</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Quá trình chấm điểm mất nhiều thời gian hơn dự kiến. 
                  Kết quả sẽ được cập nhật sau vài phút.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {successResults.length > 0 && successResults.map((result, idx) => {
        if (result.type === 'mcq') {
          return <AttemptAnswersView key={idx} data={result.data} />;
        }
        return <AssessmentResults key={idx} results={result} type={result.type} onRetrySuccess={onRetrySuccess} />;
      })}

      {assessmentError && (
        <Card className="shadow-lg border-red-500">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-red-600">{assessmentError}</p>
              <Button
                variant="outline"
                onClick={() => {
                  if (attemptId) {
                    onViewDetails(attemptId);
                  }
                }}
              >
                Xem kết quả sau
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(allResults.length > 0 || hasTimeout) && !isPolling && (
        <div className="flex justify-center gap-3">
          {allResults[0]?.type === 'mcq' ? (
            <Button size="lg" asChild>
              <Link href={`/account/attempts/${attemptId}`}>
                Xem chi tiết đáp án
              </Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href="/account?history-tests">
                {hasTimeout ? 'Xem kết quả sau' : 'Xem danh sách kết quả'}
              </Link>
            </Button>
          )}
          {quizId && (
            <Button size="lg" variant="outline" asChild>
              <Link href={`/practice/${quizId}`}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Làm lại
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}
