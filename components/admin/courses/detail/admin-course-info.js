import { BookOpen, FileText, User, Calendar, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export function AdminCourseInfo({ course }) {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const infoItems = [
        {
            icon: BookOpen,
            label: "Số chương",
            value: course.moduleCount || 0,
        },
        {
            icon: FileText,
            label: "Số bài học",
            value: course.lessonCount || 0,
        },
        {
            icon: DollarSign,
            label: "Giá khóa học",
            value: formatCurrency(course.priceCents, course.currency),
        },
        {
            icon: User,
            label: "Giảng viên",
            value: course.createdBy || "Chưa cập nhật",
        },
        {
            icon: Calendar,
            label: "Cập nhật lần cuối",
            value: formatDate(course.updatedAt),
        },
    ]

    return (
        <Card className="mb-8">
            <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Thông tin khóa học</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {infoItems.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <item.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{item.label}</p>
                                <p className="font-semibold">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
