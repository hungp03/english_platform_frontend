"use client"

import { BookOpen } from "lucide-react"

export default function CoursesHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <BookOpen className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý khóa học</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý và phê duyệt các khóa học trong hệ thống
        </p>
      </div>
    </div>
  )
}