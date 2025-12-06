import { Progress } from "@/components/ui/progress"

export const ProgressIndicator = ({ currentStep, totalSteps = 2 }) => {
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Tiến trình</span>
        <span className="text-sm font-medium text-gray-700">{currentStep}/{totalSteps}</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">Bước 1: Thông tin cơ bản</span>
        <span className="text-xs text-gray-500">Bước 2: Tải lên chứng chỉ</span>
      </div>
    </div>
  )
}