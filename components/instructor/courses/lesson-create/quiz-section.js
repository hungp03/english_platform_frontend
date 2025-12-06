"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import Editor from "@/components/common/editor"

export default function QuizSection({ questions, setQuestions, introContent, onIntroChange }) {
    const addQuestion = () => {
        setQuestions([...questions, { question: "", options: ["", ""], answer: 0 }])
    }

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index))
        }
    }

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions]
        newQuestions[index][field] = value
        setQuestions(newQuestions)
    }

    const addOption = (questionIndex) => {
        const newQuestions = [...questions]
        newQuestions[questionIndex].options.push("")
        setQuestions(newQuestions)
    }

    const removeOption = (questionIndex, optionIndex) => {
        const newQuestions = [...questions]
        if (newQuestions[questionIndex].options.length > 2) {
            newQuestions[questionIndex].options.splice(optionIndex, 1)
            // Adjust answer index if needed
            if (newQuestions[questionIndex].answer >= newQuestions[questionIndex].options.length) {
                newQuestions[questionIndex].answer = newQuestions[questionIndex].options.length - 1
            }
            setQuestions(newQuestions)
        }
    }

    const updateOption = (questionIndex, optionIndex, value) => {
        const newQuestions = [...questions]
        newQuestions[questionIndex].options[optionIndex] = value
        setQuestions(newQuestions)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="quiz-intro" className="text-sm font-medium">
                    Nội dung <span className="text-muted-foreground text-xs">(tùy chọn)</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                    Thêm nội dung hiển thị trước các câu hỏi trắc nghiệm
                </p>
                <div className="min-h-[300px]">
                    <Editor
                        initialContent={introContent}
                        onContentChange={onIntroChange}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <Label className="text-sm font-medium">
                    Câu hỏi trắc nghiệm <span className="text-destructive">*</span>
                </Label>

                {questions.map((q, qIndex) => (
                    <Card key={qIndex} className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <Label className="font-medium">Câu hỏi {qIndex + 1}</Label>
                            {questions.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeQuestion(qIndex)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    Xóa
                                </Button>
                            )}
                        </div>

                        <Input
                            placeholder="Nhập câu hỏi"
                            value={q.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            className="font-medium"
                        />

                        <div className="space-y-2">
                            <Label className="text-sm">Các lựa chọn</Label>
                            {q.options.map((opt, optIndex) => (
                                <div key={optIndex} className="flex gap-2 items-center">
                                    <Checkbox
                                        checked={q.answer === optIndex}
                                        onCheckedChange={() => updateQuestion(qIndex, 'answer', optIndex)}
                                    />
                                    <Input
                                        placeholder={`Lựa chọn ${optIndex + 1}`}
                                        value={opt}
                                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                        className="flex-1"
                                    />
                                    {q.options.length > 2 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeOption(qIndex, optIndex)}
                                        >
                                            ✕
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(qIndex)}
                                className="w-full"
                            >
                                + Thêm lựa chọn
                            </Button>
                        </div>
                    </Card>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    onClick={addQuestion}
                    className="w-full"
                >
                    + Thêm câu hỏi
                </Button>
            </div>
        </div>
    )
}
