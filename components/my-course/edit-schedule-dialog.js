"use client"

import { useEffect } from "react"
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form"
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
import { Plus, Trash2, Calendar, Clock, AlertCircle } from "lucide-react"
import { updateStudyPlan } from "@/lib/api/schedule"
import { updateStudyPlanSchema } from "@/schema/study-plan"
import { useAuthStore } from "@/store/auth-store"
import Link from "next/link"

export default function EditScheduleDialog({ open, onOpenChange, onSuccess, studyPlan }) {
    const { user } = useAuthStore()

    // Check if user has linked Google account
    const isGoogleLinked = user?.provider === "GOOGLE"

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError: setFormError
    } = useForm({
        resolver: zodResolver(updateStudyPlanSchema),
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: "schedules"
    })

    // Watch the schedules array to check for database IDs
    const watchedSchedules = useWatch({
        control,
        name: "schedules"
    })

    // Load study plan data when dialog opens
    useEffect(() => {
        if (open && studyPlan) {
            // Format schedules for form (convert ISO to datetime-local format in local timezone)
            const formattedSchedules = studyPlan.schedules?.map((schedule) => {
                let formattedStartTime = ""
                if (schedule.startTime) {
                    const date = new Date(schedule.startTime)
                    // Format to datetime-local format (YYYY-MM-DDTHH:mm) in local timezone
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    const hours = String(date.getHours()).padStart(2, '0')
                    const minutes = String(date.getMinutes()).padStart(2, '0')
                    formattedStartTime = `${year}-${month}-${day}T${hours}:${minutes}`
                }
                return {
                    id: schedule.id,
                    startTime: formattedStartTime,
                    durationMin: schedule.durationMin || "",
                    taskDesc: schedule.taskDesc || "",
                    syncToCalendar: schedule.syncToCalendar || false
                }
            }) || []

            reset({
                title: studyPlan.title || "",
                schedules: formattedSchedules.length > 0 ? formattedSchedules : [{
                    startTime: "",
                    durationMin: "",
                    taskDesc: "",
                    syncToCalendar: false
                }]
            })
        }
    }, [open, studyPlan, reset])

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            reset()
        }
    }, [open, reset])

    const onSubmit = async (data) => {
        try {
            // Convert datetime-local to ISO string and preserve IDs for existing schedules
            const formattedSchedules = data.schedules.map((schedule) => {
                const formatted = {
                    startTime: new Date(schedule.startTime).toISOString(),
                    durationMin: parseInt(schedule.durationMin, 10),
                    taskDesc: schedule.taskDesc,
                    // Only allow sync if Google is linked
                    syncToCalendar: isGoogleLinked ? (schedule.syncToCalendar || false) : false
                }

                // Only include ID if it exists (for existing schedules)
                if (schedule.id) {
                    formatted.id = schedule.id
                }

                return formatted
            })

            const result = await updateStudyPlan(studyPlan.id, {
                title: data.title.trim(),
                schedules: formattedSchedules
            })

            if (result.success) {
                reset()
                onOpenChange(false)
                onSuccess?.(result.data)
            } else {
                setFormError("root", {
                    type: "manual",
                    message: result.error || "Cập nhật nhắc nhở học tập thất bại"
                })
            }
        } catch (err) {
            setFormError("root", {
                type: "manual",
                message: "Có lỗi xảy ra khi cập nhật nhắc nhở học tập"
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa nhắc nhở học tập</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin nhắc nhở học tập và các buổi học
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Tiêu đề <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="Ví dụ: Complete TOEIC 750+ in 3 months"
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

                        {fields.map((field, index) => {
                            // Check if this schedule has a database ID (not React Hook Form's field.id)
                            const hasDbId = watchedSchedules?.[index]?.id

                            return (
                                <div
                                    key={field.id}
                                    className="p-4 border rounded-lg space-y-3 bg-muted/40"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">
                                            Plan #{index + 1}
                                            {hasDbId && <span className="text-xs text-muted-foreground ml-2">(Đã tồn tại)</span>}
                                            {!hasDbId && <span className="text-xs text-green-600 ml-2">(Mới)</span>}
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

                                    {/* Hidden ID field to preserve existing schedule IDs */}
                                    <input type="hidden" {...register(`schedules.${index}.id`)} />

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
                            )
                        })}
                    </div>

                    {/* Error messages */}
                    {errors.root && (
                        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-3">
                            {errors.root.message}
                        </div>
                    )}
                    {errors.schedules && !Array.isArray(errors.schedules) && (
                        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-3">
                            {errors.schedules.message || "Có lỗi trong lịch học"}
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
                            {isSubmitting ? "Đang cập nhật..." : "Cập nhật nhắc nhở học tập"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
