import { Card, CardContent } from "@/components/ui/card"
import { Bell } from "lucide-react"
import ReminderCard from "./reminder-card"

export default function RemindersList({ reminders }) {
    if (reminders.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Chưa có nhắc nhở nào
                    </h3>
                    <p className="text-gray-600">
                        Thiết lập nhắc nhở để không bỏ lỡ thời gian học tập
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {reminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
        </div>
    )
}
