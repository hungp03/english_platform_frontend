import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import { retrySpeakingGrading, retryWritingGrading, getSpeakingResults, getWritingResults } from "@/lib/api/attempt";

export default function AssessmentResults({ results: initialResults, type = 'speaking', onRetrySuccess }) {
  const [results, setResults] = useState(initialResults);
  const [retrying, setRetrying] = useState(false);
  const [polling, setPolling] = useState(false);
  const [retryError, setRetryError] = useState(null);

  if (!results) return null;

  const isSpeaking = type === 'speaking';
  const hasScore = results.aiScore !== null && results.aiScore !== undefined;

  const pollForResults = async (submissionId) => {
    const maxAttempts = 40;
    const pollInterval = 3000;
    const getResultsFn = isSpeaking ? getSpeakingResults : getWritingResults;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const res = await getResultsFn(submissionId);
        if (res?.success && res.data?.aiScore !== null) {
          setResults(prev => ({ ...prev, ...res.data }));
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (err) {
        console.error('Poll error:', err);
      }
    }
    return false;
  };

  const handleRetry = async () => {
    if (!results.id) return;
    
    setRetrying(true);
    setRetryError(null);
    
    try {
      const retryFn = isSpeaking ? retrySpeakingGrading : retryWritingGrading;
      const res = await retryFn(results.id);
      
      if (res.success) {
        setRetrying(false);
        setPolling(true);
        
        const success = await pollForResults(results.id);
        setPolling(false);
        
        if (success) {
          onRetrySuccess?.();
        } else {
          setRetryError("Chấm điểm quá lâu. Vui lòng thử lại sau.");
        }
      } else {
        setRetryError(res.error);
        setRetrying(false);
      }
    } catch (err) {
      setRetryError("Có lỗi xảy ra khi retry");
      setRetrying(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          {hasScore ? (
            <span className="text-green-600">✓</span>
          ) : polling ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          ) : (
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          )}
          {hasScore ? "Kết quả chấm điểm" : polling ? "Đang chấm điểm" : "Chưa có kết quả"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question */}
        {results.questionContent && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Câu hỏi:</h3>
            <article
              className="prose prose-sm max-w-none p-4 bg-muted rounded-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(results.questionContent) }}
            />
          </div>
        )}

        {/* Audio Player (Speaking only) */}
        {isSpeaking && results.audioUrl && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Bản ghi âm của bạn:
            </h3>
            <div className="p-4 bg-muted rounded-lg">
              <audio 
                controls 
                className="w-full"
                src={results.audioUrl}
              >
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
            </div>
          </div>
        )}

        {/* Overall Score or Retry */}
        {hasScore ? (
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
              {results.aiScore}
            </div>
            <div className="text-lg text-muted-foreground">/10</div>
            <Badge variant="secondary" className="mt-2">
              Điểm tổng
            </Badge>
          </div>
        ) : polling ? (
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Đang chấm điểm...</h3>
              <p className="text-sm text-muted-foreground mt-2">
                AI đang phân tích câu trả lời của bạn. Quá trình này có thể mất 30-60 giây.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-xl space-y-4">
            <p className="text-center text-muted-foreground">
              Bài làm chưa được chấm điểm. Bạn có thể thử lại.
            </p>
            {retryError && (
              <p className="text-sm text-red-600">{retryError}</p>
            )}
            <Button 
              onClick={handleRetry} 
              disabled={retrying}
              variant="outline"
            >
              {retrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi yêu cầu...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Chấm điểm lại
                </>
              )}
            </Button>
          </div>
        )}

        {/* Detailed Scores */}
        {hasScore && (
          <div className="grid grid-cols-2 gap-4">
            {isSpeaking ? (
              <>
                <ScoreItem label="Fluency & Coherence" score={results.aiFluency} />
                <ScoreItem label="Pronunciation" score={results.aiPronunciation} />
                <ScoreItem label="Grammar" score={results.aiGrammar} />
                <ScoreItem label="Vocabulary" score={results.aiVocabulary} />
              </>
            ) : (
              <>
                <ScoreItem label="Task Response" score={results.aiTaskResponse} />
                <ScoreItem label="Coherence & Cohesion" score={results.aiCoherence} />
                <ScoreItem label="Grammar" score={results.aiGrammar} />
                <ScoreItem label="Vocabulary" score={results.aiVocabulary} />
              </>
            )}
          </div>
        )}

        {/* Transcript (Speaking only) */}
        {isSpeaking && results.transcript && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Nội dung bạn đã nói:</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{results.transcript}</p>
            </div>
          </div>
        )}

        {/* Answer Text (Writing only) */}
        {!isSpeaking && results.answerText && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Bài viết của bạn:</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{results.answerText}</p>
            </div>
          </div>
        )}

        {/* Feedback */}
        {results.feedback && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Nhận xét chi tiết:</h3>
            <article
              className="prose prose-sm max-w-none p-4 bg-muted rounded-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(results.feedback.replace(/\n/g, '<br>')) }}
            />
          </div>
        )}

        {/* Corrections */}
        {results.corrections && results.corrections.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Các lỗi cần sửa:</h3>
            <div className="space-y-3">
              {results.corrections.map((correction, index) => (
                <div key={index} className="p-4 border rounded-lg bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{correction.type}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium text-red-600 line-through">{correction.original}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-green-600">{correction.corrected}</span>
                    </p>
                  </div>
                  {correction.explanation && (
                    <p className="text-sm text-muted-foreground">{correction.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreItem({ label, score }) {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold text-primary">
        {score !== null ? score : '-'}/10
      </div>
    </div>
  );
}
