"use client"

import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { ChevronDown, ChevronRight, FileText, CheckCircle2, Clock, PlayCircle, HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getPublishedModules } from "@/lib/api/course-module"
import { listPublishedCourseLessons } from "@/lib/api/lesson"
import { CourseModulesSkeleton } from "./course-modules-skeleton"
import { LessonPreviewDialog } from "./lesson-preview-dialog"
import { useAuthStore } from "@/store/auth-store"

// Memoize lesson icon component
const LessonIcon = memo(({ kind }) => {
  switch (kind) {
    case "VIDEO":
      return <PlayCircle className="w-4 h-4" />
    case "QUIZ":
      return <HelpCircle className="w-4 h-4" />
    default:
      return <FileText className="w-4 h-4" />
  }
})
LessonIcon.displayName = "LessonIcon"

// Memoize lesson kind label
const getLessonKindLabel = (kind) => {
  switch (kind) {
    case "VIDEO":
      return "Video"
    case "QUIZ":
      return "Quiz"
    default:
      return "Bài học"
  }
}

// Memoize individual lesson item
const LessonItem = memo(({ lesson, moduleId, onLessonClick }) => (
  <div
    onClick={() => onLessonClick(lesson, moduleId)}
    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
      lesson.isFree
        ? "hover:bg-background/50 cursor-pointer"
        : "opacity-75"
    }`}
  >
    <div className="text-muted-foreground">
      <LessonIcon kind={lesson.kind} />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {lesson.title}
        </span>
        {lesson.isFree && (
          <Badge variant="secondary" className="text-xs">
            Miễn phí
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {lesson.estimatedMin} phút
        </span>
        <span>{getLessonKindLabel(lesson.kind)}</span>
      </div>
    </div>
  </div>
))
LessonItem.displayName = "LessonItem"

export const CourseModules = memo(({ courseId }) => {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState(new Set())
  const [moduleLessons, setModuleLessons] = useState({})
  const [loadingLessons, setLoadingLessons] = useState(new Set())
  const [previewLesson, setPreviewLesson] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Only select isAuthenticated from store to minimize re-renders
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useMemo(() => !!user, [user])

  const fetchModules = useCallback(async () => {
    setLoading(true)
    const result = await getPublishedModules(courseId)

    if (result.success) {
      setModules(result.data || [])
    }

    setLoading(false)
  }, [courseId])

  useEffect(() => {
    if (courseId) {
      fetchModules()
    }
  }, [courseId, fetchModules])

  const toggleModule = useCallback(async (moduleId) => {
    const isCurrentlyExpanded = expandedModules.has(moduleId)

    setExpandedModules((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })

    // Fetch lessons if expanding and not already loaded
    if (!isCurrentlyExpanded && !moduleLessons[moduleId]) {
      setLoadingLessons((prev) => new Set(prev).add(moduleId))

      const result = await listPublishedCourseLessons(moduleId)

      if (result.success) {
        setModuleLessons((prev) => ({
          ...prev,
          [moduleId]: result.data || []
        }))
      }

      setLoadingLessons((prev) => {
        const newSet = new Set(prev)
        newSet.delete(moduleId)
        return newSet
      })
    }
  }, [expandedModules, moduleLessons])

  const handleLessonClick = useCallback((lesson, moduleId) => {
    if (lesson.isFree) {
      setPreviewLesson({ ...lesson, moduleId })
      setIsPreviewOpen(true)
    }
  }, [])

  if (loading) {
    return <CourseModulesSkeleton />
  }

  if (!modules || modules.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Nội dung khóa học</h2>
          <p className="text-muted-foreground">
            Chưa có nội dung nào được công bố
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Nội dung khóa học</h2>
        <div className="space-y-3">
          {modules.map((module) => {
            const isExpanded = expandedModules.has(module.id)
            return (
              <div
                key={module.id}
                className="border rounded-lg overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{module.title}</span>
                        {module.published && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>{module.lessonCount || 0} bài học</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    Chương {module.position}
                  </Badge>
                </button>

                {isExpanded && (
                  <div className="border-t bg-muted/20 p-4">
                    {loadingLessons.has(module.id) ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <Skeleton className="w-4 h-4 rounded" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : moduleLessons[module.id] && moduleLessons[module.id].length > 0 ? (
                      <div className="space-y-2">
                        {moduleLessons[module.id].map((lesson) => (
                          <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            moduleId={module.id}
                            onLessonClick={handleLessonClick}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Chương này chưa có bài học nào được công bố.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>

      <LessonPreviewDialog
        lesson={previewLesson}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        isAuthenticated={isAuthenticated}
      />
    </Card>
  )
})

CourseModules.displayName = "CourseModules"
