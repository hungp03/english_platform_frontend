import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle2 } from "lucide-react"

export default function EnrollmentCard({ enrollment, formatDate, getStatusBadge }) {
    return (
        <Link
            href={`/courses/${enrollment.courseSlug}/learn`}
            className="group"
        >
            <Card className="h-full hover:shadow-lg transition-shadow p-0 gap-0">
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-200">
                    <Image
                        src={enrollment.courseThumbnail || "/course-placeholder.jpeg"}
                        alt={enrollment.courseTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                        {getStatusBadge(enrollment.status)}
                    </div>
                </div>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {enrollment.courseTitle}
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium">
                                    {enrollment.progressPercent.toFixed(0)}%
                                </span>
                            </div>
                            <Progress value={enrollment.progressPercent} className="h-2" />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                                Bắt đầu: {formatDate(enrollment.startedAt)}
                            </span>
                        </div>

                        {enrollment.completedAt && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>
                                    Hoàn thành: {formatDate(enrollment.completedAt)}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
