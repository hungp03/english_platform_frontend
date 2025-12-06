import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, X } from "lucide-react"
import LessonNavigation from "./lesson-navigation"

export default function QuizLesson({
  lesson,
  selectedAnswers,
  quizSubmitted,
  onAnswerSelect,
  onSubmit,
  onRetake,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onMarkComplete
}) {
  const handleNextClick = () => {
    // Mark as complete if quiz is submitted
    if (quizSubmitted && onMarkComplete && lesson?.id) {
      onMarkComplete(lesson.id, false)
    }
    if (onNext) {
      onNext()
    }
  }
  if (!lesson) return null

  const questions = lesson.content?.body?.questions || []

  return (
    <div className="space-y-6">
      <LessonNavigation
        onPrevious={onPrevious}
        onNext={handleNextClick}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />

      <h1 className="text-3xl font-bold">{lesson.title}</h1>

      {lesson.content?.body?.quizzes_content && (
        <div className="border rounded-lg p-6 bg-muted/20">
          <h3 className="font-semibold text-lg mb-4">Mô tả</h3>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: lesson.content.body.quizzes_content
            }}
          />
        </div>
      )}

      {questions.length > 0 ? (
        <>
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const selectedOption = selectedAnswers[idx]
              const correctOption = q.answer
              const isCorrect = selectedOption === correctOption

              return (
                <Card key={idx} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Badge variant="outline" className="mt-1">
                        {idx + 1}
                      </Badge>
                      <p className="font-medium text-lg flex-1">
                        {q.question}
                      </p>
                      {quizSubmitted && (
                        <Badge
                          variant={isCorrect ? "default" : "destructive"}
                          className={isCorrect ? "bg-green-500" : ""}
                        >
                          {isCorrect ? "Đúng" : "Sai"}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      {q.options.map((opt, i) => {
                        const isSelected = selectedOption === i
                        const isCorrectAnswer = i === correctOption

                        let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all "

                        if (quizSubmitted) {
                          if (isCorrectAnswer) {
                            buttonClass += "bg-green-50 border-green-500 dark:bg-green-950/50 "
                          } else if (isSelected && !isCorrect) {
                            buttonClass += "bg-red-50 border-red-500 dark:bg-red-950/50 "
                          } else {
                            buttonClass += "bg-muted/20 border-muted "
                          }
                        } else {
                          if (isSelected) {
                            buttonClass += "bg-primary/10 border-primary "
                          } else {
                            buttonClass += "bg-muted/20 border-muted hover:border-primary/50 hover:bg-primary/5 "
                          }
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => onAnswerSelect(idx, i)}
                            disabled={quizSubmitted}
                            className={buttonClass}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                                }`}>
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="flex-1">{opt}</span>
                              {quizSubmitted && isCorrectAnswer && (
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                              )}
                              {quizSubmitted && isSelected && !isCorrect && (
                                <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quiz Actions */}
          <div className="flex items-center justify-between p-6 border rounded-lg bg-muted/20">
            <div className="text-sm text-muted-foreground">
              {quizSubmitted ? (
                <span className="font-medium">
                  Kết quả: {Object.keys(selectedAnswers).filter((key) =>
                    selectedAnswers[key] === questions[key].answer
                  ).length}/{questions.length} câu đúng
                </span>
              ) : (
                <span>
                  Đã trả lời: {Object.keys(selectedAnswers).length}/{questions.length} câu hỏi
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {quizSubmitted ? (
                <Button onClick={onRetake} variant="outline">
                  Làm lại
                </Button>
              ) : (
                <Button
                  onClick={onSubmit}
                  disabled={Object.keys(selectedAnswers).length < questions.length}
                >
                  Nộp bài
                </Button>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">Chưa có câu hỏi nào</p>
      )}
    </div>
  )
}
