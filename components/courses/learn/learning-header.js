import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function LearningHeader({ 
  course, 
  progress, 
  onMenuClick 
}) {
  return (
    <div className="border-b p-4 flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>
      <h1 className="font-semibold text-lg truncate flex-1">
        {course?.title}
      </h1>
      
      {/* Progress Section */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Tiến độ</p>
          <p className="text-sm font-semibold">
            {progress.completed}/{progress.total} bài học
          </p>
        </div>
        <div className="relative">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress.percentage / 100)}`}
              className="text-primary transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold">{progress.percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
