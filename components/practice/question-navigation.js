import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const QuestionNavigation = memo(function QuestionNavigation({ 
  onPrevious, 
  onNext, 
  canGoPrevious, 
  canGoNext 
}) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!canGoPrevious}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Trước
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!canGoNext}
      >
        Tiếp theo
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
});

export default QuestionNavigation;
