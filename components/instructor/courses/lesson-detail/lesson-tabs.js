"use client"

import { useState, useRef } from "react"
import { Video, FileText, Upload, X, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadCourseVideo, getSignedVideoUrl } from "@/lib/api/course"
import { toast } from "sonner"

export default function LessonTabs({ lesson, onEditContent, onVideoUploaded }) {
  const [selectedVideoFile, setSelectedVideoFile] = useState(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [signedVideoUrl, setSignedVideoUrl] = useState(null)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const videoRef = useRef(null)
  const kind = lesson.kind?.toLowerCase()
  const content = lesson.content || {}

  // Nếu là bài viết / nội dung HTML
  const body = content.body || {}
  const intro = body.intro || ""
  const sections = body.sections || []

  // Nếu là quiz
  const quizItems = content.quizItems || []
  
  const mediaId = lesson.primaryMediaId || null

  // Fetch signed video URL
  const handleFetchSignedUrl = async (resumeTime = null) => {
    if (!mediaId) {
      toast.error("Không có media ID")
      return
    }

    setIsLoadingVideo(true)
    try {
      const result = await getSignedVideoUrl(mediaId)
      if (result.success) {
        setSignedVideoUrl(result.data.signedUrl)

        // Resume playback at the specified time if provided
        if (resumeTime !== null && videoRef.current) {
          // Wait for video to be ready, then seek to the saved position
          const video = videoRef.current
          const handleLoadedMetadata = () => {
            video.currentTime = resumeTime
            video.play().catch(err => console.error("Auto-play failed:", err))
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
          }
          video.addEventListener('loadedmetadata', handleLoadedMetadata)
        }
      } else {
        toast.error(result.error || "Không thể lấy URL video")
      }
    } catch (err) {
      console.error("Error fetching signed video URL:", err)
      toast.error("Đã xảy ra lỗi khi lấy URL video")
    } finally {
      setIsLoadingVideo(false)
    }
  }

  // Handle video error (e.g., expired token)
  const handleVideoError = async (e) => {
    const video = videoRef.current
    if (!video || !mediaId) return

    // Check if it's a network/loading error (likely expired token)
    const error = e.target.error
    if (error && (error.code === MediaError.MEDIA_ERR_NETWORK || error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED)) {
      console.warn("Video error detected, attempting to refresh token...")

      // Save current playback position
      const currentTime = video.currentTime

      // Fetch new signed URL and resume playback
      await handleFetchSignedUrl(currentTime)
    }
  }

  // Hàm render HTML an toàn (vì content đến từ backend của bạn)
  const renderHtml = (html) => (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )

  // Xử lý chọn file video
  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      setSelectedVideoFile(file)
      // Tạo URL preview cho video
      const previewUrl = URL.createObjectURL(file)
      setVideoPreviewUrl(previewUrl)
    }
  }

  // Xóa file đã chọn
  const handleRemoveVideoFile = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
    }
    setSelectedVideoFile(null)
    setVideoPreviewUrl(null)
  }

  // Xử lý upload video
  const handleUploadVideo = async () => {
    if (!selectedVideoFile) return

    setIsUploading(true)
    try {
      // Upload video file
      const uploadResult = await uploadCourseVideo(selectedVideoFile)

      if (!uploadResult.success) {
        toast.error(uploadResult.error || "Không thể tải video lên")
        return
      }

      const uploadedMedia = uploadResult.data

      toast.success(
        `Video đã được tải lên và ${uploadedMedia.meta?.status === "processing" ? "đang xử lý" : "sẵn sàng"}`
      )

      // Clean up preview
      handleRemoveVideoFile()

      // Notify parent component with media ID
      if (onVideoUploaded) {
        onVideoUploaded(uploadedMedia.id)
      }
    } catch (err) {
      console.error("Error uploading video:", err)
      toast.error("Đã xảy ra lỗi khi tải video lên")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Tabs
      defaultValue={kind === "quiz" ? "quiz" : "content"}
      className="w-full"
      onValueChange={(value) => {
        // Fetch signed URL when video tab is selected
        if (value === "video" && mediaId && !signedVideoUrl && !videoPreviewUrl) {
          handleFetchSignedUrl()
        }
      }}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="content" disabled={kind === "quiz"} className="gap-2">
          <FileText className="h-4 w-4" /> Nội dung
        </TabsTrigger>
        <TabsTrigger value="video" disabled={kind !== "video"} className="gap-2">
          <Video className="h-4 w-4" /> Video
        </TabsTrigger>
      </TabsList>

      {/* VIDEO */}
      {kind === "video" && (
        <TabsContent value="video" className="mt-6">
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {videoPreviewUrl ? (
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : signedVideoUrl ? (
                <video
                  ref={videoRef}
                  src={signedVideoUrl}
                  controls
                  className="w-full h-full object-cover"
                  onError={handleVideoError}
                />
              ) : isLoadingVideo ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : mediaId ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Không thể tải video
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Không có video chính
                </div>
              )}
            </div>

            {/* File upload section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="video-upload" className="text-sm font-medium">
                  Tải lên video mới
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="cursor-pointer"
                  />
                  {selectedVideoFile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveVideoFile}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {selectedVideoFile && (
                  <p className="text-sm text-muted-foreground">
                    Đã chọn: {selectedVideoFile.name} (
                    {(selectedVideoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleUploadVideo}
                disabled={!selectedVideoFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      )}

      {/* ARTICLE / HTML */}
      {kind !== "quiz" && (
        <TabsContent value="content" className="mt-6">
          <div className="space-y-6">
            {intro && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-foreground">{intro}</p>
              </div>
            )}
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                {section.title && (
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                )}
                {section.html && renderHtml(section.html)}
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={onEditContent}>
              Chỉnh sửa nội dung
            </Button>
          </div>
        </TabsContent>
      )}

      {/* QUIZ */}
      {kind === "quiz" && (
        <TabsContent value="quiz" className="mt-6">
          <div className="space-y-4">
            {quizItems.length > 0 ? (
              quizItems.map((q, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-muted/40 transition"
                >
                  <p className="font-medium mb-2">
                    Câu {index + 1}: {q.question}
                  </p>
                  <ul className="space-y-1">
                    {q.options.map((opt, i) => (
                      <li
                        key={i}
                        className={`p-2 rounded border ${
                          i === q.correctAnswer
                            ? "border-green-500 bg-green-100 text-green-700 font-semibold"
                            : "border-border"
                        }`}
                      >
                        {opt}
                        {i === q.correctAnswer && (
                          <Badge className="ml-2 bg-green-600 text-white">Đúng</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Chưa có câu hỏi nào</p>
            )}

            <Button variant="outline" className="w-full" onClick={onEditContent}>
              Chỉnh sửa Quiz
            </Button>
          </div>
        </TabsContent>
      )}
    </Tabs>
  )
}
