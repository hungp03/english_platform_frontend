import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import { Play, Clock, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
export function CourseCard({ course }) {
  const skills = course.skillFocus || []
  const visibleSkills = skills.slice(0, 2)
  const remainingCount = skills.length - visibleSkills.length
  const rating = course.averageRating || 0;
  const reviewCount = course.totalReviews || 0;

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

            <div className="flex items-center gap-1 mb-2 text-sm">
              <span className="font-bold text-amber-500 flex items-center">
                  {rating.toFixed(1)} <Star className="w-3 h-3 ml-0.5 fill-amber-500" />
              </span>
              <span className="text-muted-foreground text-xs">
                  ({reviewCount} đánh giá)
              </span>
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
                {course.priceCents === 0 ? "Miễn phí" : formatCurrency(course.priceCents, course.currency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
