import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function LessonNavigation({
    onPrevious,
    onNext,
    hasPrevious,
    hasNext
}) {
    return (
        <div className="flex items-center justify-between pb-4 mb-2">
            <Button
                variant="outline"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="flex items-center gap-2"
            >
                <ChevronLeft className="h-4 w-4" />
                Bài trước
            </Button>

            <Button
                variant="default"
                onClick={onNext}
                disabled={!hasNext}
                className="flex items-center gap-2"
            >
                Bài tiếp theo
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
