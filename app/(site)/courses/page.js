import { Suspense } from "react"
import Courses from "./courses"

export const metadata = {
  title: "Khóa học - English Pro"
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Courses />
    </Suspense>
  )
}
