"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, FilePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createLesson } from "@/lib/api/lesson"
import { lessonSchema } from "@/schema/course"
import LessonBasicInfo from "@/components/instructor/courses/lesson-create/lesson-basic-info"
import ContentSection from "@/components/instructor/courses/lesson-create/content-section"
import QuizSection from "@/components/instructor/courses/lesson-create/quiz-section"

function PageHeader({ courseId, moduleId }) {
    return (
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href={`/instructor/courses/${courseId}/modules/${moduleId}`}>
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <FilePlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Tạo bài học mới</h1>
                    <p className="text-sm text-muted-foreground hidden sm:block">
                        Thêm bài học vào module
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LessonCreatePage() {
    const router = useRouter()
    const { courseId, moduleId } = useParams()
    const [loading, setLoading] = useState(false)
    const contentRef = useRef("")
    const quizIntroRef = useRef("")
    const [introText, setIntroText] = useState("")
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
                    sections: []
                }
            },
            mediaId: "",
        },
    })

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = form

    const lessonKind = watch("kind")

    const handleContentChange = useCallback((newContent) => {
        contentRef.current = newContent
    }, [])

    const handleQuizIntroChange = useCallback((newContent) => {
        quizIntroRef.current = newContent
    }, [])

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

            const res = await createLesson(moduleId, payload)
            if (res.success) {
                toast.success("Tạo bài học thành công!")
                router.push(`/instructor/courses/${courseId}/modules/${moduleId}`)
            } else {
                toast.error(res.error || "Không thể tạo bài học")
            }
        } catch (err) {
            console.error(err)
            toast.error("Đã xảy ra lỗi khi tạo bài học")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
            <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
                <PageHeader courseId={courseId} moduleId={moduleId} />

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Thông tin bài học</CardTitle>
                        <CardDescription>Các trường đánh dấu * là bắt buộc</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                    introContent=""
                                    onIntroChange={handleQuizIntroChange}
                                />
                            ) : (
                                <ContentSection
                                    introText={introText}
                                    setIntroText={setIntroText}
                                    onContentChange={handleContentChange}
                                    errors={errors}
                                />
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="sm:flex-1"
                                    onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}`)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    className="sm:flex-1"
                                    disabled={loading}
                                >
                                    {loading ? "Đang tạo..." : lessonKind === "VIDEO" ? "Tạo và upload video" : "Tạo bài học"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
