"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

export function CourseInfo({ course }) {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <Image
          src={course.thumbnail || "/course-placeholder.jpeg"}
          alt={course.title}
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          width={80}
          height={80}
          priority
        />
        <div className="flex flex-col justify-center flex-1">
          <h2 className="text-xl font-bold">{course.title}</h2>
          <p className="text-lg font-semibold mt-1">
            {formatCurrency(course.priceCents, course.currency)}
          </p>
        </div>
      </div>
    </Card>
  )
}
