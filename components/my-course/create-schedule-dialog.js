"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Calendar, Clock, Sparkles, AlertCircle } from "lucide-react"
import { createStudyPlan, generateAIPlan } from "@/lib/api/schedule"
import { createStudyPlanSchema } from "@/schema/study-plan"
import { useAuthStore } from "@/store/auth-store"
import Link from "next/link"

export default function CreateScheduleDialog({ open, onOpenChange, onSuccess }) {
    const { user } = useAuthStore()
    const [showAIForm, setShowAIForm] = useState(false)
    const [aiGenerating, setAiGenerating] = useState(false)
    const [aiInputs, setAiInputs] = useState({
        goal: "",
        totalTime: "",
        notes: ""
    })
    const [aiGeneratedPlan, setAiGeneratedPlan] = useState(null)

    // Check if user has linked Google account
    const isGoogleLinked = user?.provider === "GOOGLE"

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        setError: setFormError
    } = useForm({
        resolver: zodResolver(createStudyPlanSchema),
        defaultValues: {
            title: "",
            schedules: [
                {
                    startTime: "",
                    durationMin: "",
                    taskDesc: "",
                    syncToCalendar: false
                }
            ]
        }
    })

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "schedules"
    })

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            reset()
            setShowAIForm(false)
            setAiInputs({ goal: "", totalTime: "", notes: "" })
            setAiGeneratedPlan(null)
        }
    }, [open, reset])

    const onSubmit = async (data) => {
        try {
            // Convert datetime-local to ISO string
            const formattedSchedules = data.schedules.map((schedule) => ({
                startTime: new Date(schedule.startTime).toISOString(),
                durationMin: parseInt(schedule.durationMin, 10),
                taskDesc: schedule.taskDesc,
                // Only allow sync if Google is linked
                syncToCalendar: isGoogleLinked ? (schedule.syncToCalendar || false) : false
            }))

            const result = await createStudyPlan({
                title: data.title.trim(),
                schedules: formattedSchedules
            })

            if (result.success) {
                reset()
                onOpenChange(false)
                onSuccess?.()
            } else {
                setFormError("root", {
                    type: "manual",
                    message: result.error || "Tạo nhắc nhở học tập thất bại"
                })
            }
        } catch (err) {
            setFormError("root", {
                type: "manual",
                message: "Có lỗi xảy ra khi tạo nhắc nhở học tập"
            })
        }
    }

    const handleAddSchedule = () => {
        append({
            startTime: "",
            durationMin: "",
            taskDesc: "",
            syncToCalendar: false
        })
    }

    const handleGenerateAI = async () => {
        if (!aiInputs.goal || !aiInputs.totalTime) {
            setFormError("root", {
                type: "manual",
                message: "Vui lòng nhập mục tiêu và tổng thời gian"
            })
            return
        }

        setAiGenerating(true)
        try {
            const result = await generateAIPlan({
                goal: aiInputs.goal,
                totalTime: parseInt(aiInputs.totalTime, 10),
                notes: aiInputs.notes || undefined
            })

            if (result.success && result.data) {
                setAiGeneratedPlan(result.data)

                // Populate form with AI generated data
                setValue("title", result.data.title || "")

                // Replace all schedules at once (more efficient than removing one by one)
                const newSchedules = result.data.schedules?.map((schedule) => {
                    // Convert ISO string to datetime-local format
                    const date = new Date(schedule.startTime)
                    const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16)

                    return {
                        startTime: localDateTime,
                        durationMin: schedule.durationMin.toString(),
                        taskDesc: schedule.taskDesc || "",
                        syncToCalendar: false
                    }
                }) || []

                replace(newSchedules)
                setShowAIForm(false)
            } else {
                setFormError("root", {
                    type: "manual",
                    message: result.error || "Tạo nhắc nhở học tập bằng AI thất bại"
                })
            }
        } catch (err) {
            setFormError("root", {
                type: "manual",
                message: "Có lỗi xảy ra khi tạo nhắc nhở học tập AI"
            })
        } finally {
            setAiGenerating(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tạo nhắc nhở học tập mới</DialogTitle>
                    <DialogDescription>
                        Tạo nhắc nhở học tập chi tiết với các buổi học cụ thể
                    </DialogDescription>
                </DialogHeader>

                {/* AI Generation Toggle */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">
                            Tạo tự động bằng AI
                        </span>
                    </div>
                    <Button
                        type="button"
                        variant={showAIForm ? "secondary" : "default"}
                        size="sm"
                        onClick={() => setShowAIForm(!showAIForm)}
                        disabled={isSubmitting || aiGenerating}
                    >
                        {showAIForm ? "Đóng" : "Sử dụng AI"}
                    </Button>
                </div>

                {/* AI Input Form */}
                {showAIForm && (
                    <div className="space-y-4 p-4 bg-purple-50/50 rounded-lg border border-purple-200">
                        <div className="space-y-2">
                            <Label htmlFor="ai-goal">
                                Mục tiêu học tập <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="ai-goal"
                                placeholder="Ví dụ: Cải thiện kỹ năng nói tiếng Anh cho phỏng vấn xin việc"
                                value={aiInputs.goal}
                                onChange={(e) => setAiInputs({ ...aiInputs, goal: e.target.value })}
                                disabled={aiGenerating}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ai-totalTime">
                                Tổng thời gian (phút) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="ai-totalTime"
                                type="number"
                                min="1"
                                placeholder="120"
                                value={aiInputs.totalTime}
                                onChange={(e) => setAiInputs({ ...aiInputs, totalTime: e.target.value })}
                                disabled={aiGenerating}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ai-notes">
                                Ghi chú thêm (tùy chọn)
                            </Label>
                            <Textarea
                                id="ai-notes"
                                placeholder="Ví dụ: Tập trung vào từ vựng kinh doanh và kỹ năng thuyết trình"
                                value={aiInputs.notes}
                                onChange={(e) => setAiInputs({ ...aiInputs, notes: e.target.value })}
                                disabled={aiGenerating}
                                rows={2}
                            />
                        </div>

                        <Button
                            type="button"
                            onClick={handleGenerateAI}
                            disabled={aiGenerating || !aiInputs.goal || !aiInputs.totalTime}
                            className="w-full"
                        >
                            {aiGenerating ? (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                    Đang tạo nhắc nhở học tập...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Tạo nhắc nhở học tập AI
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* AI Generated Plan Info */}
                {aiGeneratedPlan && !showAIForm && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-green-600 mt-0.5" />
                            <div className="flex-1 text-sm text-green-800">
                                <p className="font-medium">Kế hoạch được tạo bởi AI</p>
                                <p className="text-xs mt-1 text-green-700">
                                    Mục tiêu: {aiInputs.goal} • Thời gian: {aiInputs.totalTime} phút
                                </p>
                                <p className="text-xs mt-1 text-green-700">
                                    Lưu ý: Nhắc nhở học tập chỉ mang tính chất tham khảo. Vui lòng xem xét trước khi lưu.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Tiêu đề <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="Ví dụ: Complete TOEIC 650+ in 3 months"
                            {...register("title")}
                            disabled={isSubmitting}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Schedules */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>
                                Lịch học <span className="text-red-500">*</span>
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddSchedule}
                                disabled={isSubmitting}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm lịch học
                            </Button>
                        </div>

                        {/* Google Calendar Sync Warning */}
                        {!isGoogleLinked && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>
                                    Bạn cần{" "}
                                    <Link href="/account" className="underline font-medium hover:text-amber-900">
                                        liên kết tài khoản Google
                                    </Link>
                                    {" "}để sử dụng tính năng đồng bộ với Google Calendar
                                </p>
                            </div>
                        )}

                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="p-4 border rounded-lg space-y-3 bg-muted/40"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                        Plan #{index + 1}
                                    </span>
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            disabled={isSubmitting}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor={`schedules.${index}.startTime`}>
                                            <Calendar className="w-3 h-3 inline mr-1" />
                                            Thời gian bắt đầu
                                        </Label>
                                        <Input
                                            id={`schedules.${index}.startTime`}
                                            type="datetime-local"
                                            {...register(`schedules.${index}.startTime`)}
                                            disabled={isSubmitting}
                                        />
                                        {errors.schedules?.[index]?.startTime && (
                                            <p className="text-xs text-red-500">
                                                {errors.schedules[index].startTime.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`schedules.${index}.durationMin`}>
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            Thời lượng (phút)
                                        </Label>
                                        <Input
                                            id={`schedules.${index}.durationMin`}
                                            type="number"
                                            min="1"
                                            placeholder="60"
                                            {...register(`schedules.${index}.durationMin`)}
                                            disabled={isSubmitting}
                                        />
                                        {errors.schedules?.[index]?.durationMin && (
                                            <p className="text-xs text-red-500">
                                                {errors.schedules[index].durationMin.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`schedules.${index}.taskDesc`}>
                                        Mô tả nhiệm vụ
                                    </Label>
                                    <Textarea
                                        id={`schedules.${index}.taskDesc`}
                                        placeholder="Ví dụ: Làm riêng từng part bạn muốn luyện tập - Part 1 & 2"
                                        {...register(`schedules.${index}.taskDesc`)}
                                        disabled={isSubmitting}
                                        rows={2}
                                    />
                                    {errors.schedules?.[index]?.taskDesc && (
                                        <p className="text-xs text-red-500">
                                            {errors.schedules[index].taskDesc.message}
                                        </p>
                                    )}
                                </div>

                                {/* Sync to Google Calendar */}
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name={`schedules.${index}.syncToCalendar`}
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id={`schedules.${index}.syncToCalendar`}
                                                checked={isGoogleLinked ? field.value : false}
                                                onCheckedChange={(checked) => {
                                                    if (isGoogleLinked) {
                                                        field.onChange(checked)
                                                    }
                                                }}
                                                disabled={isSubmitting || !isGoogleLinked}
                                            />
                                        )}
                                    />
                                    <Label
                                        htmlFor={`schedules.${index}.syncToCalendar`}
                                        className={`text-sm font-normal ${isGoogleLinked ? 'cursor-pointer' : 'cursor-not-allowed text-muted-foreground'}`}
                                    >
                                        Đồng bộ với Google Calendar
                                    </Label>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Error message */}
                    {errors.root && (
                        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-3">
                            {errors.root.message}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Đang tạo..." : "Tạo nhắc nhở học tập"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
