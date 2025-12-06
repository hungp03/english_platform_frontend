import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getLessonWithEnrollmentCheck } from "@/lib/api/enrollment"

export function useLessonNavigation(slug, determinedLessonId, modules) {
    const router = useRouter()
    const [currentLesson, setCurrentLesson] = useState(null)
    const [loadingLesson, setLoadingLesson] = useState(false)
    const [expandedModules, setExpandedModules] = useState(new Set())

    useEffect(() => {
        if (!determinedLessonId) return

        fetchLessonDetail(determinedLessonId)

        const currentModule = modules.find(m =>
            m.lessons?.some(l => l.id === determinedLessonId)
        )
        if (currentModule) {
            setExpandedModules(new Set([currentModule.id]))
        }
    }, [determinedLessonId])

    const fetchLessonDetail = async (lessonId) => {
        setLoadingLesson(true)
        try {
            const result = await getLessonWithEnrollmentCheck(lessonId)

            if (result.success) {
                setCurrentLesson(result.data)
            } else {
                toast.error(result.error || "Không thể tải nội dung bài học")
                setCurrentLesson(null)
            }
        } catch (err) {
            console.error("Error fetching lesson detail:", err)
            toast.error("Đã xảy ra lỗi khi tải bài học")
            setCurrentLesson(null)
        } finally {
            setLoadingLesson(false)
        }
    }

    const handleLessonClick = (lesson) => {
        router.push(`/courses/${slug}/learn?lesson=${lesson.id}`)
    }

    const toggleModule = (moduleId) => {
        setExpandedModules((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId)
            } else {
                newSet.add(moduleId)
            }
            return newSet
        })
    }

    return {
        currentLesson,
        loadingLesson,
        expandedModules,
        handleLessonClick,
        toggleModule
    }
}
