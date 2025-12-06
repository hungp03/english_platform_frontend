import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Star, Users } from "lucide-react"

export function CourseHeader({ course, reviewStats }) {
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

        {/* Course Info - Takes more space */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{course.title}</h1>

          {/* Rating & Students */}
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            {reviewStats && reviewStats.totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-yellow-600">{reviewStats.averageRating.toFixed(1)}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(reviewStats.averageRating)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({reviewStats.totalReviews})</span>
              </div>
            )}
            {course.studentCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{course.studentCount} học viên</span>
              </div>
            )}
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
