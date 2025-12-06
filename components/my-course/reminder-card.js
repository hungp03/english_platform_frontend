import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar } from "lucide-react"

export default function ReminderCard({ reminder }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                            {reminder.courseTitle}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{reminder.reminderTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{reminder.days.join(", ")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant={reminder.isActive ? "default" : "secondary"}>
                            {reminder.isActive ? "Đang bật" : "Đã tắt"}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
