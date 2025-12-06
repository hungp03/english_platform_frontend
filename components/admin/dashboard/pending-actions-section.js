import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function PendingActionsSection({ pendingActions }) {
  const totalPending =
    (pendingActions?.instructorRequestsCount || 0) +
    (pendingActions?.forumReportsCount || 0) +
    (pendingActions?.pendingOrdersCount || 0) +
    (pendingActions?.quizzesGradingCount || 0);

  if (totalPending === 0) return null;

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium mb-2">Có {totalPending} tác vụ cần xử lý:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {pendingActions.instructorRequestsCount > 0 && (
            <Badge variant="secondary">
              {pendingActions.instructorRequestsCount} yêu cầu giảng viên
            </Badge>
          )}
          {pendingActions.forumReportsCount > 0 && (
            <Badge variant="secondary">
              {pendingActions.forumReportsCount} báo cáo forum
            </Badge>
          )}
          {pendingActions.pendingOrdersCount > 0 && (
            <Badge variant="secondary">
              {pendingActions.pendingOrdersCount} đơn hàng chờ
            </Badge>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
