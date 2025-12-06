import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Clock, Calendar, CheckCircle2, Circle, Edit, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { markScheduleComplete, deleteStudyPlan } from "@/lib/api/schedule"

export default function ScheduleCard({ studyPlan, onEdit, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [schedules, setSchedules] = useState(studyPlan.schedules)

    // Update local state when studyPlan prop changes
    useEffect(() => {
        setSchedules(studyPlan.schedules)
    }, [studyPlan.schedules])

    const formatTime = (isoString) => {
        if (!isoString) return "N/A"
        const date = new Date(isoString)
        return date.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        })
    }

    const handleToggleComplete = async (scheduleId, currentStatus) => {
        // Optimistic UI update
        const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED"
        setSchedules(prevSchedules =>
            prevSchedules.map(schedule =>
                schedule.id === scheduleId
                    ? { ...schedule, status: newStatus }
                    : schedule
            )
        )

        try {
            const result = await markScheduleComplete(studyPlan.id, scheduleId)
            if (!result.success) {
                // Revert on failure
                setSchedules(prevSchedules =>
                    prevSchedules.map(schedule =>
                        schedule.id === scheduleId
                            ? { ...schedule, status: currentStatus }
                            : schedule
                    )
                )
            }
        } catch (err) {
            // Revert on error
            setSchedules(prevSchedules =>
                prevSchedules.map(schedule =>
                    schedule.id === scheduleId
                        ? { ...schedule, status: currentStatus }
                        : schedule
                )
            )
        }
    }

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        setIsDeleting(true)
        setDeleteDialogOpen(false)

        try {
            const result = await deleteStudyPlan(studyPlan.id)
            if (result.success) {
                onDelete?.(studyPlan.id)
            }
        } catch (err) {
            // Error handling - could add a toast notification here
        } finally {
            setIsDeleting(false)
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: { label: "Chưa bắt đầu", variant: "secondary", icon: Circle },
            IN_PROGRESS: { label: "Đang thực hiện", variant: "default", icon: Clock },
            COMPLETED: { label: "Hoàn thành", variant: "success", icon: CheckCircle2 },
        }
        const config = statusConfig[status] || { label: status, variant: "default", icon: Circle }
        const Icon = config.icon
        return (
            <Badge variant={config.variant} className="text-xs flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{studyPlan.title}</CardTitle>
                        <div className="text-xs text-muted-foreground">
                            Tạo ngày: {formatTime(studyPlan.createdAt)}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit?.(studyPlan)}
                            disabled={isDeleting}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting ? "Đang xóa..." : "Xóa"}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {schedules && schedules.length > 0 ? (
                        schedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className="flex items-start gap-3 p-3 rounded-lg border bg-muted/40"
                            >
                                <Checkbox
                                    checked={schedule.status === "COMPLETED"}
                                    onCheckedChange={() => handleToggleComplete(schedule.id, schedule.status)}
                                    className="mt-0.5"
                                />
                                <div className="flex-1 space-y-1">
                                    <p className={`font-medium text-sm ${schedule.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
                                        {schedule.taskDesc}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatTime(schedule.startTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{schedule.durationMin} phút</span>
                                        </div>
                                    </div>
                                </div>
                                <div>{getStatusBadge(schedule.status)}</div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                            Chưa có lịch học nào
                        </p>
                    )}
                </div>
            </CardContent>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa nhắc nhở học tập</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa nhắc nhở học tập "{studyPlan.title}"?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}
