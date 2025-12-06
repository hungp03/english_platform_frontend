import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import EnrollmentCard from "./enrollment-card"

export default function CoursesList({
    enrollments,
    pagination,
    formatDate,
    getStatusBadge,
    onPageChange,
}) {
    if (enrollments.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Chưa có khóa học nào
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học của chúng tôi!
                    </p>
                    <Link
                        href="/courses"
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Khám phá khóa học
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrollments.map((enrollment) => (
                    <EnrollmentCard
                        key={enrollment.id}
                        enrollment={enrollment}
                        formatDate={formatDate}
                        getStatusBadge={getStatusBadge}
                    />
                ))}
            </div>

            {pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                    <Pagination
                        totalPages={pagination.pages}
                        currentPage={pagination.page}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </>
    )
}
