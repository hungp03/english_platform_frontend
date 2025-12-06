"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, FileEdit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { updateLesson, getLessonDetail } from "@/lib/api/lesson"
import { lessonSchema } from "@/schema/course"
import LessonBasicInfo from "@/components/instructor/courses/lesson-create/lesson-basic-info"
import ContentSection from "@/components/instructor/courses/lesson-create/content-section"
import QuizSection from "@/components/instructor/courses/lesson-create/quiz-section"

function PageHeader({ courseId, moduleId, lessonId }) {
    return (
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`}>
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <FileEdit className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Chỉnh sửa bài học</h1>
                    <p className="text-sm text-muted-foreground hidden sm:block">
                        Cập nhật thông tin cho bài học
                    </p>
                </div>
            </div>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-56" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function LessonEditPage() {
    const router = useRouter()
    const { courseId, moduleId, lessonId } = useParams()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [isPublished, setIsPublished] = useState(false)
    const contentRef = useRef("")
    const quizIntroRef = useRef("")
    const [introText, setIntroText] = useState("")
    const [initialContentHtml, setInitialContentHtml] = useState("")
    const [initialQuizIntro, setInitialQuizIntro] = useState("")
    const [questions, setQuestions] = useState([
        { question: "", options: ["", ""], answer: 0 }
    ])

    const form = useForm({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            title: "",
            kind: "VIDEO",
            estimatedMin: 10,
            position: "",
            isFree: false,
            content: {
                type: "html",
                body: {
                    intro: "",
                    sections: [{ html: "" }]
                }
            },
            mediaId: "",
        },
        mode: "onSubmit",
    })

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = form

    const lessonKind = watch("kind")

    // Fetch lesson data on mount
    useEffect(() => {
        async function fetchLesson() {
            try {
                const res = await getLessonDetail(moduleId, lessonId)
                if (res.success && res.data) {
                    const lesson = res.data

                    // Check if lesson is published
                    if (lesson.published) {
                        setIsPublished(true)
                        toast.error("Bài học đã được xuất bản. Vui lòng hủy xuất bản trước khi chỉnh sửa")
                        router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
                        return
                    }

                    // Set form values
                    reset({
                        title: lesson.title || "",
                        kind: lesson.kind || "VIDEO",
                        estimatedMin: lesson.estimatedMin || 10,
                        position: lesson.position ?? "",
                        isFree: lesson.isFree || false,
                        mediaId: lesson.primaryMediaId || "",
                        content: {
                            type: lesson.kind === "QUIZ" ? "quiz" : "html",
                            body: lesson.kind === "QUIZ"
                                ? { questions: lesson.content?.body?.questions || [] }
                                : {
                                    intro: lesson.content?.body?.intro || "",
                                    sections: lesson.content?.body?.sections || [{ html: "" }]
                                }
                        }
                    })

                    // Set content based on lesson type
                    if (lesson.kind === "QUIZ" && lesson.content?.body?.questions) {
                        setQuestions(lesson.content.body.questions)
                        if (lesson.content.body.quizzes_content) {
                            setInitialQuizIntro(lesson.content.body.quizzes_content)
                            quizIntroRef.current = lesson.content.body.quizzes_content
                        }
                    } else if (lesson.content?.body) {
                        setIntroText(lesson.content.body.intro || "")
                        if (lesson.content.body.sections?.[0]?.html) {
                            const htmlContent = lesson.content.body.sections[0].html
                            setInitialContentHtml(htmlContent)
                            contentRef.current = htmlContent
                        }
                    }
                } else {
                    toast.error(res.error || "Không thể tải thông tin bài học")
                    router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
                }
            } catch (err) {
                console.error(err)
                toast.error("Đã xảy ra lỗi khi tải thông tin bài học")
                router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
            } finally {
                setInitialLoading(false)
            }
        }
        fetchLesson()
    }, [lessonId, moduleId, courseId, reset, router])

    const handleContentChange = (newContent) => {
        contentRef.current = newContent
    }

    const handleQuizIntroChange = (newContent) => {
        quizIntroRef.current = newContent
    }

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const payload = {
                title: data.title.trim(),
                kind: data.kind,
                estimatedMin: data.estimatedMin,
                position: data.position !== undefined && data.position !== "" ? data.position : undefined,
                isFree: data.isFree,
                content: {
                    type: data.kind === "QUIZ" ? "quiz" : "html",
                    body: data.kind === "QUIZ"
                        ? {
                            quizzes_content: quizIntroRef.current || undefined,
                            questions: questions
                        }
                        : {
                            intro: introText.trim() || undefined,
                            sections: contentRef.current
                                ? [{ html: contentRef.current }]
                                : undefined
                        }
                },
                mediaId: data.mediaId && data.mediaId.trim() !== "" ? data.mediaId : null,
            }
            const res = await updateLesson(moduleId, lessonId, payload)

            if (res.success) {
                toast.success("Cập nhật bài học thành công!")
                router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
            } else {
                toast.error(res.error || "Không thể cập nhật bài học")
            }
        } catch (err) {
            console.error("Error:", err)
            toast.error("Đã xảy ra lỗi khi cập nhật bài học")
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="p-4 sm:p-6 min-h-full bg-background">
                <div className="max-w-5xl mx-auto">
                    <LoadingSkeleton />
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
            <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
                <PageHeader courseId={courseId} moduleId={moduleId} lessonId={lessonId} />

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Thông tin bài học</CardTitle>
                        <CardDescription>Các trường đánh dấu * là bắt buộc</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit, (errors) => {
                            console.error("Form validation failed:", errors)
                            toast.error("Vui lòng kiểm tra lại các trường bắt buộc")
                        })} className="space-y-6">
                            <LessonBasicInfo
                                register={register}
                                watch={watch}
                                setValue={setValue}
                                errors={errors}
                            />

                            {lessonKind === "QUIZ" ? (
                                <QuizSection
                                    questions={questions}
                                    setQuestions={setQuestions}
                                    introContent={initialQuizIntro}
                                    onIntroChange={handleQuizIntroChange}
                                />
                            ) : (
                                <ContentSection
                                    introText={introText}
                                    setIntroText={setIntroText}
                                    initialContent={initialContentHtml}
                                    onContentChange={handleContentChange}
                                    errors={errors}
                                />
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="sm:flex-1"
                                    onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    className="sm:flex-1"
                                    disabled={loading}
                                >
                                    {loading ? "Đang cập nhật..." : "Cập nhật bài học"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
