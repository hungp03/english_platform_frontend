"use client"

import { useEffect, useState, useRef } from "react"
import { Clock, PlayCircle, HelpCircle, FileText, LogIn, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getFreeLessonDetail } from "@/lib/api/lesson"
import { getSignedVideoUrl } from "@/lib/api/course"
import { toast } from "sonner"

export function LessonPreviewDialog({ lesson, open, onOpenChange, isAuthenticated }) {
    const [lessonDetail, setLessonDetail] = useState(null)
    const [loading, setLoading] = useState(false)
    const [signedVideoUrl, setSignedVideoUrl] = useState(null)
    const [isLoadingVideo, setIsLoadingVideo] = useState(false)
    const [quizAnswers, setQuizAnswers] = useState({})
    const [quizSubmitted, setQuizSubmitted] = useState(false)
    const videoRef = useRef(null)
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

    useEffect(() => {
        if (open && isAuthenticated && lesson) {
            fetchLessonDetail()
        } else {
            setLessonDetail(null)
            setSignedVideoUrl(null)
            setQuizAnswers({})
            setQuizSubmitted(false)
        }
    }, [open, isAuthenticated, lesson])

    const fetchLessonDetail = async () => {
        if (!lesson?.moduleId || !lesson?.id) return

        setLoading(true)
        try {
            const result = await getFreeLessonDetail(lesson.moduleId, lesson.id)
            if (result.success) {
                setLessonDetail(result.data)

                // If it's a video lesson, fetch signed URL
                if (result.data.kind === "VIDEO" && result.data.primaryMediaId) {
                    fetchSignedVideoUrl(result.data.primaryMediaId)
                }
            } else {
                toast.error(result.error || "Không thể tải nội dung bài học")
            }
        } catch (error) {
            console.error("Error fetching lesson detail:", error)
            toast.error("Đã xảy ra lỗi khi tải bài học")
        } finally {
            setLoading(false)
        }
    }

    const fetchSignedVideoUrl = async (mediaId) => {
        setIsLoadingVideo(true)
        try {
            const result = await getSignedVideoUrl(mediaId)
            if (result.success) {
                setSignedVideoUrl(result.data.signedUrl)
            } else {
                toast.error(result.error || "Không thể tải video")
            }
        } catch (error) {
            console.error("Error fetching video URL:", error)
            toast.error("Đã xảy ra lỗi khi tải video")
        } finally {
            setIsLoadingVideo(false)
        }
    }

    const handleVideoError = async (e) => {
        const video = videoRef.current
        if (!video || !lessonDetail?.primaryMediaId) return

        const error = e.target.error
        if (error && (error.code === MediaError.MEDIA_ERR_NETWORK || error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED)) {
            const currentTime = video.currentTime
            await fetchSignedVideoUrl(lessonDetail.primaryMediaId)

            if (videoRef.current) {
                videoRef.current.currentTime = currentTime
            }
        }
    }

    const handleSubmitQuiz = () => {
        setQuizSubmitted(true)
    }

    const handleResetQuiz = () => {
        setQuizAnswers({})
        setQuizSubmitted(false)
    }

    const calculateScore = () => {
        const questions = lessonDetail?.content?.body?.questions || []
        let correct = 0
        questions.forEach((q, idx) => {
            if (quizAnswers[idx] === q.answer) {
                correct++
            }
        })
        return correct
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            )
        }

        if (!lessonDetail) return null

        const content = lessonDetail.content || {}
        const body = content.body || {}

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {lessonDetail.estimatedMin} phút
                    </span>
                    <span>{getLessonKindLabel(lessonDetail.kind)}</span>
                </div>

                {/* VIDEO TYPE */}
                {lessonDetail.kind === "VIDEO" && (
                    <div className="space-y-4">
                        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                            {isLoadingVideo ? (
                                <div className="flex h-full items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                            ) : signedVideoUrl ? (
                                <video
                                    ref={videoRef}
                                    src={signedVideoUrl}
                                    controls
                                    className="w-full h-full object-cover"
                                    onError={handleVideoError}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-white">
                                    Không có video
                                </div>
                            )}
                        </div>

                        {/* Text content for video lessons */}
                        {body.intro && (
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm">{body.intro}</p>
                            </div>
                        )}

                        {body.sections && body.sections.length > 0 && (
                            <div className="space-y-4">
                                {body.sections.map((section, idx) => (
                                    <div key={idx} className="space-y-2">
                                        {section.title && (
                                            <h3 className="font-semibold text-lg">{section.title}</h3>
                                        )}
                                        {section.html && (
                                            <div
                                                className="prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: section.html }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TEXT TYPE */}
                {lessonDetail.kind === "TEXT" && (
                    <div className="space-y-4">
                        {body.intro && (
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm">{body.intro}</p>
                            </div>
                        )}

                        {body.sections && body.sections.length > 0 && (
                            <div className="space-y-4">
                                {body.sections.map((section, idx) => (
                                    <div key={idx} className="space-y-2">
                                        {section.title && (
                                            <h3 className="font-semibold text-lg">{section.title}</h3>
                                        )}
                                        {section.html && (
                                            <div
                                                className="prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: section.html }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* QUIZ TYPE */}
                {lessonDetail.kind === "QUIZ" && (
                    <div className="space-y-4">
                        {body.quizzes_content && (
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: body.quizzes_content }}
                                />
                            </div>
                        )}

                        {body.questions && body.questions.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Câu hỏi</h3>
                                {body.questions.map((q, idx) => {
                                    const userAnswer = quizAnswers[idx]
                                    const isCorrect = quizSubmitted && userAnswer === q.answer
                                    const isWrong = quizSubmitted && userAnswer !== undefined && userAnswer !== q.answer

                                    return (
                                        <div key={idx} className={`border rounded-lg p-4 ${quizSubmitted
                                            ? isCorrect
                                                ? 'border-green-500 bg-green-50'
                                                : isWrong
                                                    ? 'border-red-500 bg-red-50'
                                                    : ''
                                            : ''
                                            }`}>
                                            <div className="flex items-start justify-between mb-3">
                                                <p className="font-medium">
                                                    {idx + 1}. {q.question}
                                                </p>
                                                {quizSubmitted && (
                                                    <Badge variant={isCorrect ? "default" : "destructive"} className="ml-2">
                                                        {isCorrect ? "Đúng" : userAnswer !== undefined ? "Sai" : "Chưa trả lời"}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="space-y-2 ml-4">
                                                {q.options.map((opt, i) => {
                                                    const isSelected = userAnswer === i
                                                    const isCorrectAnswer = i === q.answer

                                                    return (
                                                        <label
                                                            key={i}
                                                            className={`flex items-center gap-2 cursor-pointer p-2 rounded transition-colors ${quizSubmitted
                                                                ? isCorrectAnswer
                                                                    ? 'bg-green-100 border border-green-500 font-medium'
                                                                    : isSelected && !isCorrectAnswer
                                                                        ? 'bg-red-100 border border-red-500'
                                                                        : 'opacity-60'
                                                                : isSelected
                                                                    ? 'bg-blue-100 border border-blue-500'
                                                                    : 'hover:bg-muted/50'
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`q${idx}`}
                                                                value={i}
                                                                checked={isSelected}
                                                                onChange={() => {
                                                                    if (!quizSubmitted) {
                                                                        setQuizAnswers(prev => ({ ...prev, [idx]: i }))
                                                                    }
                                                                }}
                                                                disabled={quizSubmitted}
                                                                className="cursor-pointer"
                                                            />
                                                            <span>{opt}</span>
                                                            {quizSubmitted && isCorrectAnswer && (
                                                                <Badge variant="outline" className="ml-auto bg-green-600 text-white border-green-600">
                                                                    Đáp án đúng
                                                                </Badge>
                                                            )}
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}

                                {!quizSubmitted ? (
                                    <Button
                                        onClick={handleSubmitQuiz}
                                        className="w-full"
                                        disabled={Object.keys(quizAnswers).length === 0}
                                    >
                                        Nộp bài
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <p className="font-semibold mb-2">Kết quả:</p>
                                            <p className="text-sm">
                                                Bạn trả lời đúng {calculateScore()} / {body.questions.length} câu
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleResetQuiz}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Làm lại
                                        </Button>
                                    </div>
                                )}

                                <p className="text-sm text-muted-foreground mt-4">
                                    Đây chỉ là bản xem trước. Đăng ký khóa học để trải nghiệm toàn bộ nội dung.
                                </p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Chưa có câu hỏi nào</p>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[90vw] lg:max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto w-full">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {lesson && getLessonIcon(lesson.kind)}
                        <span>{lesson?.title}</span>
                        <Badge variant="secondary" className="text-xs ml-2">
                            Xem trước miễn phí
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                {!isAuthenticated ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            <LogIn className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Đăng nhập để xem bài học</h3>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Vui lòng đăng nhập để xem nội dung bài học miễn phí này và khám phá thêm nhiều khóa học khác.
                        </p>
                        <div className="flex gap-3">
                            <Link href="/login">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Đăng nhập
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="outline">
                                    Đăng ký ngay
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    renderContent()
                )}
            </DialogContent>
        </Dialog>
    )
}
