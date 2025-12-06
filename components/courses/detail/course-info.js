import Link from "next/link"
import { BookOpen, FileText, User, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function CourseInfo({ course }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  
  const instructorName = course.createdBy || "Chưa cập nhật";
  const instructorId = course.instructorId;

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
      icon: User,
      label: "Giảng viên",
      value: instructorId ? (<Link href={`/instructors/${instructorId}`} className="text-primary hover:underline">{instructorName}</Link>) : instructorName,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
