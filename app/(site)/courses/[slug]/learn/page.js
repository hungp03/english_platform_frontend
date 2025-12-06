"use client"

import { useState, useCallback, useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import {
  LearningHeader,
  VideoLesson,
  QuizLesson,
  CourseSidebar,
  LoadingSkeleton
} from "@/components/courses/learn"
import { Skeleton } from "@/components/ui/skeleton"
import { useCourseEnrollment } from "@/hooks/learn-course/use-course-enrollment"
import { useLessonNavigation } from "@/hooks/learn-course/use-lesson-navigation"
import { useQuizState } from "@/hooks/learn-course/use-quiz-state"
import { useLessonCompletion } from "@/hooks/learn-course/use-lesson-completion"
import { useCourseProgress } from "@/hooks/learn-course/use-course-progress"
import { useLessonSequence } from "@/hooks/learn-course/use-lesson-sequence"

export default function LessonPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { slug } = params
  const lessonIdFromUrl = searchParams.get('lesson')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch enrollment data and determine lesson
  const {
    enrollmentData,
    course,
    modules,
    setModules,
    completedLessons,
    setCompletedLessons,
    determinedLessonId,
    loading
  } = useCourseEnrollment(slug, lessonIdFromUrl)

  // Handle lesson navigation
  const {
    currentLesson,
    loadingLesson,
    expandedModules,
    handleLessonClick,
    toggleModule
  } = useLessonNavigation(slug, determinedLessonId, modules)

  // Handle quiz state
  const {
    selectedAnswers,
    quizSubmitted,
    handleAnswerSelect,
    handleQuizSubmit,
    handleRetakeQuiz
  } = useQuizState(currentLesson, determinedLessonId)

  // Handle lesson completion
  const { handleToggleComplete, markAsComplete } = useLessonCompletion(
    completedLessons,
    setCompletedLessons,
    setModules,
    enrollmentData
  )

  // Calculate progress (reactively updates when completedLessons changes)
  const progress = useCourseProgress(modules, completedLessons)

  // Get previous/next lesson navigation
  const { previousLesson, nextLesson, hasPrevious, hasNext } = useLessonSequence(
    modules,
    determinedLessonId
  )

  const isQuizLesson = useMemo(() => 
    currentLesson?.kind?.toLowerCase() === "quiz",
    [currentLesson?.kind]
  )

  const handleMenuClick = useCallback(() => {
    setSidebarOpen(true)
  }, [])

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const handleLessonClickWithSidebar = useCallback((lesson) => {
    handleLessonClick(lesson)
    setSidebarOpen(false)
  }, [handleLessonClick])

  const handlePreviousLesson = useCallback(() => {
    if (previousLesson) {
      handleLessonClick(previousLesson)
    }
  }, [previousLesson, handleLessonClick])

  const handleNextLesson = useCallback(() => {
    // For TEXT lessons, mark as complete when clicking next
    if (currentLesson?.kind === "TEXT" && currentLesson?.id) {
      markAsComplete(currentLesson.id, false)
    }

    if (nextLesson) {
      handleLessonClick(nextLesson)
    }
  }, [currentLesson, nextLesson, handleLessonClick, markAsComplete])

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <LearningHeader
        course={course}
        progress={progress}
        onMenuClick={handleMenuClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lesson Content - 75% on desktop */}
        <div className="flex-1 lg:w-3/4 overflow-auto">
          <div className="p-6 lg:p-8 max-w-5xl">
            {loadingLesson ? (
              <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="aspect-video w-full max-w-4xl mx-auto" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            ) : !currentLesson ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Không tìm thấy bài học
              </div>
            ) : isQuizLesson ? (
              <QuizLesson
                lesson={currentLesson}
                selectedAnswers={selectedAnswers}
                quizSubmitted={quizSubmitted}
                onAnswerSelect={handleAnswerSelect}
                onSubmit={handleQuizSubmit}
                onRetake={handleRetakeQuiz}
                onPrevious={handlePreviousLesson}
                onNext={handleNextLesson}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onMarkComplete={markAsComplete}
              />
            ) : (
              <VideoLesson
                lesson={currentLesson}
                onPrevious={handlePreviousLesson}
                onNext={handleNextLesson}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onMarkComplete={markAsComplete}
              />
            )}
          </div>
        </div>

        {/* Sidebar - 25% on desktop, overlay on mobile */}
        <div
          className={`
            fixed lg:static inset-y-0 right-0 z-50
            w-80 lg:w-1/4 
            border-l bg-background
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          `}
        >
          <CourseSidebar
            modules={modules}
            currentLessonId={determinedLessonId}
            expandedModules={expandedModules}
            completedLessons={completedLessons}
            onToggleModule={toggleModule}
            onLessonClick={handleLessonClickWithSidebar}
            onToggleComplete={handleToggleComplete}
            onClose={handleCloseSidebar}
            isMobile={true}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={handleCloseSidebar}
          />
        )}
      </div>
    </div>
  )
}
