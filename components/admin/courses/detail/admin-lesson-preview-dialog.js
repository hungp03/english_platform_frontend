"use client"

import { useEffect, useState, useRef } from "react"
import { Clock, PlayCircle, HelpCircle, FileText, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getReviewLessonDetail } from "@/lib/api/lesson"
import { getSignedVideoUrl } from "@/lib/api/course"
import { toast } from "sonner"

export function AdminLessonPreviewDialog({ lesson, open, onOpenChange }) {
    const [lessonDetail, setLessonDetail] = useState(null)
    const [loading, setLoading] = useState(false)
    const [signedVideoUrl, setSignedVideoUrl] = useState(null)
    const [isLoadingVideo, setIsLoadingVideo] = useState(false)
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
        if (open && lesson) {
            fetchLessonDetail()
        } else {
            setLessonDetail(null)
            setSignedVideoUrl(null)
        }
    }, [open, lesson])

    const fetchLessonDetail = async () => {
        if (!lesson?.moduleId || !lesson?.id) return

        setLoading(true)
        try {
            const result = await getReviewLessonDetail(lesson.moduleId, lesson.id)
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
                        <div className="aspect-video w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden">
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
                                {body.questions.map((q, idx) => (
                                    <div key={idx} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <p className="font-medium">
                                                {idx + 1}. {q.question}
                                            </p>
                                        </div>
                                        <div className="space-y-2 ml-4">
                                            {q.options.map((opt, i) => {
                                                const isCorrectAnswer = i === q.answer

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`flex items-center gap-2 p-2 rounded ${isCorrectAnswer
                                                            ? 'bg-green-100 border border-green-500 font-medium'
                                                            : 'bg-muted/30'
                                                            }`}
                                                    >
                                                        <span>{opt}</span>
                                                        {isCorrectAnswer && (
                                                            <Badge variant="outline" className="ml-auto bg-green-600 text-white border-green-600">
                                                                Đáp án đúng
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
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
                            Xem trước (Admin)
                        </Badge>
                    </DialogTitle>
                </DialogHeader>
                {renderContent()}
            </DialogContent>
        </Dialog>
    )
}
