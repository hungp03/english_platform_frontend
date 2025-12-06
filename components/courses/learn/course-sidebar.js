import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronDown,
  ChevronRight,
  FileText,
  PlayCircle,
  X,
  Check
} from "lucide-react"

export default function CourseSidebar({
  modules,
  currentLessonId,
  expandedModules,
  completedLessons = new Set(),
  onToggleModule,
  onLessonClick,
  onToggleComplete,
  onClose,
  isMobile
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">Nội dung khóa học</h2>
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {modules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.has(module.id)
            return (
              <div key={module.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => onToggleModule(module.id)}
                  className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {moduleIndex + 1}. {module.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {module.lessonCount || module.lessons?.length || 0} bài học
                      </p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t bg-muted/20">
                    {module.lessons && module.lessons.length > 0 ? (
                      module.lessons.map((lesson, lessonIndex) => {
                        const isCurrentLesson = lesson.id === currentLessonId
                        const isQuiz = lesson.kind?.toLowerCase() === "quiz"
                        const isCompleted = completedLessons.has(lesson.id)

                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-center gap-2 hover:bg-muted/70 transition-colors ${isCurrentLesson ? "bg-primary/10 border-l-4 border-primary" : ""
                              }`}
                          >
                            <button
                              onClick={() => onLessonClick(lesson, module.id)}
                              className="flex-1 p-3 flex items-center gap-3 text-left min-w-0"
                            >
                              {isQuiz ? (
                                <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                              ) : (
                                <PlayCircle className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${isCurrentLesson ? "font-semibold" : ""
                                  } ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                  {lessonIndex + 1}. {lesson.title}
                                </p>
                                {lesson.estimatedMin && (
                                  <p className="text-xs text-muted-foreground">
                                    {lesson.estimatedMin} phút
                                  </p>
                                )}
                              </div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onToggleComplete?.(lesson.id)
                              }}
                              className={`p-2 mr-2 rounded-md transition-colors ${isCompleted
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-muted hover:bg-muted/70"
                                }`}
                              title={isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu đã hoàn thành"}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground text-center">
                        Chưa có bài học nào
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
