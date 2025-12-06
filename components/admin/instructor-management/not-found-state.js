import { Button } from "@/components/ui/button";

export const NotFoundState = ({ onBackClick }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy yêu cầu</p>
          <Button onClick={onBackClick}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    </div>
  );
};
