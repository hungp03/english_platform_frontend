import { useMemo } from "react"

export function useLessonSequence(modules, currentLessonId) {
    const { allLessons, currentIndex } = useMemo(() => {
        const lessons = []

        modules.forEach(module => {
            if (module.lessons && module.lessons.length > 0) {
                lessons.push(...module.lessons)
            }
        })

        const index = lessons.findIndex(lesson => lesson.id === currentLessonId)

        return {
            allLessons: lessons,
            currentIndex: index
        }
    }, [modules, currentLessonId])

    const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
    const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1
        ? allLessons[currentIndex + 1]
        : null

    return {
        previousLesson,
        nextLesson,
        hasPrevious: !!previousLesson,
        hasNext: !!nextLesson
    }
}
