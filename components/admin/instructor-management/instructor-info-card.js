import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const getStatusBadge = (status) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Chờ duyệt</Badge>;
    case "APPROVED":
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Đã duyệt</Badge>;
    case "REJECTED":
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Đã từ chối</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const InstructorInfoCard = ({ request }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin người yêu cầu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-xl font-semibold">{request.fullName}</h3>
          <p className="text-muted-foreground">{request.email}</p>
          <div className="mt-2">
            {getStatusBadge(request.status)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Kinh nghiệm</label>
              <p className="mt-1">{request.experienceYears} năm</p>
            </div>
            <div>
              <label className="text-sm font-medium">Chuyên môn</label>
              <p className="mt-1">{request.expertise || "Chưa có thông tin"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Bằng cấp</label>
              <p className="mt-1">{request.qualification || "Chưa có thông tin"}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tiểu sử</label>
            <div
              className="mt-1 text-sm p-3 bg-muted/50 rounded prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: request.bio || "Chưa có thông tin" }}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Lý do muốn trở thành giảng viên</label>
            <p className="mt-1 text-sm p-3 bg-muted/50 rounded">
              {request.reason || "Chưa có thông tin"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
