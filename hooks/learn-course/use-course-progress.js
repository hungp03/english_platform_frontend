export function useCourseProgress(modules, completedLessons) {
    const totalLessons = modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0)
    const completed = completedLessons.size
    const percentage = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0

    return { completed, total: totalLessons, percentage }
}
