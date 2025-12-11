"use client"

import { useEffect, useState, useRef } from "react"
import { Loader2, FileText, Image, Music, Video, ExternalLink } from "lucide-react"
import { getSignedVideoUrl } from "@/lib/api/course"
import { toast } from "sonner"
import LessonNavigation from "./lesson-navigation"
import { Badge } from "@/components/ui/badge"

const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return Image
  if (mimeType?.startsWith('video/')) return Video
  if (mimeType?.startsWith('audio/')) return Music
  return FileText
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function VideoLesson({
  lesson,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onMarkComplete
}) {
  const [signedVideoUrl, setSignedVideoUrl] = useState(null)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const videoRef = useRef(null)
  const countdownTimerRef = useRef(null)

  useEffect(() => {
    if (lesson?.kind === "VIDEO" && lesson?.primaryMediaId) {
      fetchSignedVideoUrl(lesson.primaryMediaId)
    } else {
      setSignedVideoUrl(null)
    }
  }, [lesson])

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
    if (!video || !lesson?.primaryMediaId) return

    const error = e.target.error
    if (error && (error.code === MediaError.MEDIA_ERR_NETWORK || error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED)) {
      const currentTime = video.currentTime
      await fetchSignedVideoUrl(lesson.primaryMediaId)

      if (videoRef.current) {
        videoRef.current.currentTime = currentTime
      }
    }
  }

  const handleVideoEnd = () => {
    if (!hasNext) return

    // Start 5 second countdown
    setCountdown(5)
    let timeLeft = 5

    countdownTimerRef.current = setInterval(() => {
      timeLeft -= 1
      setCountdown(timeLeft)

      if (timeLeft <= 0) {
        clearInterval(countdownTimerRef.current)
        setCountdown(null)
        // Mark as complete and move to next
        if (onMarkComplete && lesson?.id) {
          onMarkComplete(lesson.id, false)
        }
        if (onNext) {
          onNext()
        }
      }
    }, 1000)
  }

  const cancelAutoNext = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
      setCountdown(null)
    }
  }

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
    }
  }, [])

  if (!lesson) return null

  const content = lesson.content || {}
  const body = content.body || {}
  const attachments = lesson.mediaAssets?.filter(a => a.role === 'ATTACHMENT') || []

  return (
    <div className="space-y-4">
      <LessonNavigation
        onPrevious={onPrevious}
        onNext={onNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />

      {lesson.kind === "VIDEO" && (
        <div className="aspect-video w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden">
          {isLoadingVideo ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : signedVideoUrl ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={signedVideoUrl}
                controls
                className="w-full h-full object-cover"
                onError={handleVideoError}
                onEnded={handleVideoEnd}
              >
                Trình duyệt của bạn không hỗ trợ video.
              </video>
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-xl mb-4">Chuyển sang bài tiếp theo sau {countdown}s</p>
                    <button
                      onClick={cancelAutoNext}
                      className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-white">
              Không có video
            </div>
          )}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>

        {body.intro && (
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
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
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tài liệu đính kèm ({attachments.length})
            </h3>
            <div className="space-y-2">
              {attachments.map((attachment) => {
                const FileIcon = getFileIcon(attachment.mimeType)
                return (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 flex-shrink-0">
                      <FileIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.title || attachment.meta?.originalName || 'Tài liệu'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs">
                          {attachment.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                        {attachment.meta?.size && (
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.meta.size)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
