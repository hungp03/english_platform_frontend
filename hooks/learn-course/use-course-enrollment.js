import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getEnrollmentsBySlug } from "@/lib/api/enrollment"

export function useCourseEnrollment(slug, lessonIdFromUrl) {
    const router = useRouter()
    const [enrollmentData, setEnrollmentData] = useState(null)
    const [course, setCourse] = useState(null)
    const [modules, setModules] = useState([])
    const [completedLessons, setCompletedLessons] = useState(new Set())
    const [determinedLessonId, setDeterminedLessonId] = useState(null)
    const [loading, setLoading] = useState(true)

    const getFirstLessonId = (modules) => {
        for (const module of modules) {
            if (module.lessons && module.lessons.length > 0) {
                return module.lessons[0].id
            }
        }
        return null
    }

    const getNextLessonId = (modules, lastCompletedLessonId) => {
        for (const module of modules) {
            if (!module.lessons) continue

            const lessonIndex = module.lessons.findIndex(l => l.id === lastCompletedLessonId)

            if (lessonIndex !== -1) {
                if (lessonIndex === module.lessons.length - 1) {
                    return lastCompletedLessonId
                }
                return module.lessons[lessonIndex + 1].id
            }
        }

        return getFirstLessonId(modules)
    }

    useEffect(() => {
        async function fetchEnrollmentData() {
            if (!slug) return

            try {
                setLoading(true)

                const result = await getEnrollmentsBySlug(slug)

                if (result.success) {
                    setEnrollmentData(result.data)
                    setCourse({
                        id: result.data.courseId,
                        title: result.data.courseName,
                        slug: slug,
                    })

                    const publishedModules = result.data.publishedModules || []
                    setModules(publishedModules)

                    // Build completed lessons set from API response
                    const completedSet = new Set()
                    publishedModules.forEach(module => {
                        module.lessons?.forEach(lesson => {
                            if (lesson.isCompleted) {
                                completedSet.add(lesson.id)
                            }
                        })
                    })
                    setCompletedLessons(completedSet)

                    // Determine which lesson to load
                    let targetLessonId = null

                    if (lessonIdFromUrl) {
                        targetLessonId = lessonIdFromUrl
                    } else if (result.data.lastCompletedLessonId) {
                        targetLessonId = getNextLessonId(publishedModules, result.data.lastCompletedLessonId)
                    } else {
                        targetLessonId = getFirstLessonId(publishedModules)
                    }

                    if (targetLessonId) {
                        setDeterminedLessonId(targetLessonId)

                        if (!lessonIdFromUrl) {
                            router.replace(`/courses/${slug}/learn?lesson=${targetLessonId}`, { scroll: false })
                        }
                    }
                } else {
                    toast.error(result.error || "Không thể tải thông tin khóa học")
                }
            } catch (err) {
                console.error(err)
                toast.error("Đã xảy ra lỗi khi tải dữ liệu")
            } finally {
                setLoading(false)
            }
        }

        fetchEnrollmentData()
    }, [slug, router])

    // Separate effect to update determinedLessonId when URL changes
    useEffect(() => {
        if (lessonIdFromUrl && modules.length > 0) {
            setDeterminedLessonId(lessonIdFromUrl)
        }
    }, [lessonIdFromUrl, modules.length])

    return {
        enrollmentData,
        course,
        modules,
        setModules,
        completedLessons,
        setCompletedLessons,
        determinedLessonId,
        loading
    }
}
