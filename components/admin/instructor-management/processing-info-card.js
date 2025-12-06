import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ProcessingInfoCard = ({ request }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin xử lý</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">ID yêu cầu</label>
            <p className="mt-1 text-sm font-mono p-2 bg-muted/50 rounded">
              {request.id}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Ngày đăng ký</label>
            <p className="mt-1 text-sm">
              {new Date(request.requestedAt).toLocaleString("vi-VN")}
            </p>
          </div>

          {request.reviewedAt && (
            <>
              <div>
                <label className="text-sm font-medium">Ngày xét duyệt</label>
                <p className="mt-1 text-sm">
                  {new Date(request.reviewedAt).toLocaleString("vi-VN")}
                </p>
              </div>

              {request.reviewedByName && (
                <div>
                  <label className="text-sm font-medium">Người xét duyệt</label>
                  <p className="mt-1 text-sm">{request.reviewedByName}</p>
                </div>
              )}

              {request.adminNotes && (
                <div>
                  <label className="text-sm font-medium">Ghi chú xét duyệt</label>
                  <p className="mt-1 text-sm p-2 bg-muted/50 rounded">
                    {request.adminNotes}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
