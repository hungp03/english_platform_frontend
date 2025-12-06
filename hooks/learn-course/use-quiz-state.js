import { useState, useEffect } from "react"
import { toast } from "sonner"

export function useQuizState(currentLesson, determinedLessonId) {
    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [quizSubmitted, setQuizSubmitted] = useState(false)

    // Reset quiz state when lesson changes
    useEffect(() => {
        setSelectedAnswers({})
        setQuizSubmitted(false)
    }, [determinedLessonId])

    const handleAnswerSelect = (questionIndex, optionIndex) => {
        if (quizSubmitted) return

        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }))
    }

    const handleQuizSubmit = () => {
        if (!currentLesson?.content?.body?.questions) return

        const questions = currentLesson.content.body.questions
        const answeredCount = Object.keys(selectedAnswers).length

        if (answeredCount < questions.length) {
            toast.error(`Vui lòng trả lời tất cả ${questions.length} câu hỏi`)
            return
        }

        setQuizSubmitted(true)

        let correctCount = 0
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.answer) {
                correctCount++
            }
        })

        toast.success(`Bạn đã trả lời đúng ${correctCount}/${questions.length} câu hỏi`)
    }

    const handleRetakeQuiz = () => {
        setSelectedAnswers({})
        setQuizSubmitted(false)
    }

    return {
        selectedAnswers,
        quizSubmitted,
        handleAnswerSelect,
        handleQuizSubmit,
        handleRetakeQuiz
    }
}
