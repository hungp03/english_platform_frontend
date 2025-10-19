import Link from "next/link"
import Image from "next/image"
import { Play, Clock, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function CourseCard({ course }) {
  const formatPrice = (price, currency) => {
    if (currency === "VND") {
      return `${price.toLocaleString("vi-VN")} VNĐ`
    }
    return `${price} ${currency}`
  }

  const skills = course.skillFocus || []
  const visibleSkills = skills.slice(0, 2)
  const remainingCount = skills.length - visibleSkills.length

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group"
    >
      <Card className="flex flex-col h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 gap-0 p-0">
        <CardHeader className="p-0">
          <div className="aspect-video bg-muted rounded-t-lg overflow-hidden relative">
            <Image
              src={course.thumbnail || "/course-placeholder.jpeg"}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              placeholder="blur"
              blurDataURL="/blur-placeholder.png"
            />

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="lg" className="rounded-full">
                <Play className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 p-4">
          {/* Title + Skills + Description */}
          <div className="flex flex-col flex-1 mb-3">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-2 min-h-[3.5rem]">
              {course.title}
            </CardTitle>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 mb-3 min-h-[26px]">
              {skills.length > 0 ? (
                <>
                  {visibleSkills.map((skill, index) => (
                    <Badge key={index} className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {remainingCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +{remainingCount}
                    </Badge>
                  )}
                </>
              ) : (
                <div className="h-[20px]" />
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm line-clamp-3 flex-1">
              {course.description}
            </p>
          </div>

          {/* Info + Price + Button */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{course.moduleCount || 0} chương</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.lessonCount || 0} bài học</span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-lg font-bold text-primary mb-3">
                {formatPrice(course.priceCents, course.currency)}
              </p>

              <Button className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
