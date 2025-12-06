"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronRight, FileText, CheckCircle2, Clock, PlayCircle, HelpCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getCourseModules } from "@/lib/api/course-module"
import { listCourseLessons } from "@/lib/api/lesson"
import { AdminLessonPreviewDialog } from "./admin-lesson-preview-dialog"

export function AdminCourseModules({ courseId }) {
    const [modules, setModules] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedModules, setExpandedModules] = useState(new Set())
    const [moduleLessons, setModuleLessons] = useState({})
    const [loadingLessons, setLoadingLessons] = useState(new Set())
    const [previewLesson, setPreviewLesson] = useState(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    useEffect(() => {
        if (courseId) {
            fetchModules()
        }
    }, [courseId])

    const fetchModules = async () => {
        setLoading(true)
        const result = await getCourseModules(courseId)

        if (result) {
            setModules(result || [])
        }

        setLoading(false)
    }

    const toggleModule = async (moduleId) => {
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

            const result = await listCourseLessons(moduleId)

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
    }

    const getLessonIcon = (kind) => {
        switch (kind) {
            case "VIDEO":
                return <PlayCircle className="w-4 h-4" />
            case "QUIZ":
                return <HelpCircle className="w-4 h-4" />
            default:
                return <FileText className="w-4 h-4" />
        }
    }

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

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-6">Nội dung khóa học</h2>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, idx) => (
                            <Skeleton key={idx} className="h-16 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!modules || modules.length === 0) {
        return (
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-6">Nội dung khóa học</h2>
                    <p className="text-muted-foreground">
                        Chưa có nội dung nào
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
                                                {module.published ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-gray-400" />
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
                                                    <div
                                                        key={lesson.id}
                                                        onClick={() => {
                                                            setPreviewLesson({ ...lesson, moduleId: module.id })
                                                            setIsPreviewOpen(true)
                                                        }}
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background cursor-pointer transition-colors"
                                                    >
                                                        <div className="text-muted-foreground">
                                                            {getLessonIcon(lesson.kind)}
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
                                                                {lesson.published ? (
                                                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                                ) : (
                                                                    <XCircle className="w-3 h-3 text-gray-400" />
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
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Chương này chưa có bài học nào.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>

            <AdminLessonPreviewDialog
                lesson={previewLesson}
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
            />
        </Card>
    )
}
