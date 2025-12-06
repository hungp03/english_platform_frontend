import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export function AdminCourseHeader({ course }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "PUBLISHED":
                return "bg-green-100 text-green-800"
            case "DRAFT":
                return "bg-gray-100 text-gray-800"
            case "PENDING_REVIEW":
                return "bg-yellow-100 text-yellow-800"
            case "REJECTED":
                return "bg-red-100 text-red-800"
            case "UNPUBLISHED":
                return "bg-blue-100 text-blue-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case "PUBLISHED":
                return "Đã xuất bản"
            case "DRAFT":
                return "Nháp"
            case "PENDING_REVIEW":
                return "Chờ phê duyệt"
            case "REJECTED":
                return "Từ chối"
            case "UNPUBLISHED":
                return "Tạm ẩn"
            default:
                return status
        }
    }

    return (
        <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Course Image */}
                <div className="lg:col-span-1">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                        <Image
                            src={course.thumbnail || "/course-placeholder.jpeg"}
                            alt={course.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* Course Info */}
                <div className="lg:col-span-2 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                            {course.title}
                        </h1>
                        <Badge className={getStatusColor(course.status)}>
                            {getStatusLabel(course.status)}
                        </Badge>
                    </div>

                    <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
                        {course.description}
                    </p>

                    {/* Skills */}
                    {course.skillFocus && course.skillFocus.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {course.skillFocus.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-sm capitalize">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
