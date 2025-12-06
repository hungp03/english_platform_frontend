import { toast } from "sonner"
import { markLessonCompleted } from "@/lib/api/enrollment"

export function useLessonCompletion(
    completedLessons,
    setCompletedLessons,
    setModules,
    enrollmentData
) {
    const markAsComplete = async (lessonId, showToast = true) => {
        // Don't mark if already completed
        if (completedLessons.has(lessonId)) return

        // Optimistic update
        setCompletedLessons((prev) => {
            const newSet = new Set(prev)
            newSet.add(lessonId)
            return newSet
        })

        setModules((prevModules) =>
            prevModules.map((module) => ({
                ...module,
                lessons: module.lessons?.map((lesson) =>
                    lesson.id === lessonId
                        ? { ...lesson, isCompleted: true }
                        : lesson
                )
            }))
        )

        try {
            const result = await markLessonCompleted(lessonId, enrollmentData?.enrollmentId)

            if (result.success) {
                if (showToast) {
                    toast.success("Đã đánh dấu hoàn thành bài học")
                }
            } else {
                revertOptimisticUpdate(lessonId, false)
                toast.error(result.error || "Không thể cập nhật trạng thái bài học")
            }
        } catch (err) {
            console.error("Error marking lesson complete:", err)
            revertOptimisticUpdate(lessonId, false)
            toast.error("Đã xảy ra lỗi khi cập nhật trạng thái")
        }
    }

    const handleToggleComplete = async (lessonId) => {
        const isCurrentlyCompleted = completedLessons.has(lessonId)

        // Optimistic update - update UI immediately
        setCompletedLessons((prev) => {
            const newSet = new Set(prev)
            if (isCurrentlyCompleted) {
                newSet.delete(lessonId)
            } else {
                newSet.add(lessonId)
            }
            return newSet
        })

        // Update modules state optimistically
        setModules((prevModules) =>
            prevModules.map((module) => ({
                ...module,
                lessons: module.lessons?.map((lesson) =>
                    lesson.id === lessonId
                        ? { ...lesson, isCompleted: !isCurrentlyCompleted }
                        : lesson
                )
            }))
        )

        // Call API for both mark and unmark (backend handles both)
        try {
            const result = await markLessonCompleted(lessonId, enrollmentData?.enrollmentId)

            if (result.success) {
                if (!isCurrentlyCompleted) {
                    toast.success("Đã đánh dấu hoàn thành bài học")
                } else {
                    toast.success("Đã bỏ đánh dấu hoàn thành")
                }
            } else {
                // Revert optimistic update on failure
                revertOptimisticUpdate(lessonId, isCurrentlyCompleted)
                toast.error(result.error || "Không thể cập nhật trạng thái bài học")
            }
        } catch (err) {
            console.error("Error toggling lesson complete:", err)
            // Revert optimistic update on error
            revertOptimisticUpdate(lessonId, isCurrentlyCompleted)
            toast.error("Đã xảy ra lỗi khi cập nhật trạng thái")
        }
    }

    const revertOptimisticUpdate = (lessonId, isCurrentlyCompleted) => {
        setCompletedLessons((prev) => {
            const newSet = new Set(prev)
            if (isCurrentlyCompleted) {
                newSet.add(lessonId)
            } else {
                newSet.delete(lessonId)
            }
            return newSet
        })

        setModules((prevModules) =>
            prevModules.map((module) => ({
                ...module,
                lessons: module.lessons?.map((lesson) =>
                    lesson.id === lessonId
                        ? { ...lesson, isCompleted: isCurrentlyCompleted }
                        : lesson
                )
            }))
        )
    }

    return { handleToggleComplete, markAsComplete }
}
