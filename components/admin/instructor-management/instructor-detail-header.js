import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const InstructorDetailHeader = ({ onBack, onApprove, onReject, status }) => {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="outline" onClick={onBack} size="sm" className="md:h-10">
            <ArrowLeft className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Quay lại</span>
          </Button>
          <div>
            <h2 className="text-xl font-bold md:text-2xl">Chi tiết yêu cầu</h2>
          </div>
        </div>

        {status === "PENDING" && (
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Duyệt yêu cầu</span>
              <span className="md:hidden">Duyệt</span>
            </Button>
            <Button 
              variant="destructive" 
              onClick={onReject}
              className="flex-1 md:flex-none"
              size="sm"
            >
              <XCircle className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Từ chối yêu cầu</span>
              <span className="md:hidden">Từ chối</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
