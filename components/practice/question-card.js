import { memo, useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SpeakingRecorder from "./speaking-recorder";
import MCQOptions from "./mcq-options";
import TextAnswer from "./text-answer";
import QuestionContent from "./question-content";
import QuestionNavigation from "./question-navigation";

const QuestionCard = memo(function QuestionCard({
  current,
  index,
  total,
  answered,
  answers,
  isMCQ,
  isSpeaking,
  onChoose,
  onAudioReady,
  onNavigate
}) {
  const handlePrevious = useCallback(() => onNavigate(-1), [onNavigate]);
  const handleNext = useCallback(() => onNavigate(1), [onNavigate]);
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="default" className="text-base py-1 px-3">
              Câu {Math.min(index + 1, total)}/{total}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Đã trả lời: {answered}/{total}
            </span>
          </div>
          <QuestionNavigation 
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoPrevious={index > 0}
            canGoNext={index < total - 1}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {current && (
          <>
            <QuestionContent content={current.content} />

            {isMCQ(current) ? (
              <MCQOptions 
                question={current}
                selectedAnswer={answers[current.id]}
                onChoose={onChoose}
              />
            ) : isSpeaking(current) ? (
              <SpeakingRecorder 
                questionId={current.id} 
                onAnswer={onChoose}
                onAudioReady={onAudioReady}
              />
            ) : (
              <TextAnswer 
                questionId={current.id}
                value={answers[current.id]}
                onChoose={onChoose}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

export default QuestionCard;
