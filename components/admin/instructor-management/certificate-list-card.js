import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CertificateListCard = ({ certificates }) => {
  if (!certificates || certificates.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chứng chỉ đính kèm</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {certificates.map((cert, index) => (
            <div key={cert.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Chứng chỉ #{index + 1}</p>
                <p className="text-sm text-muted-foreground">
                  Tải lên: {new Date(cert.uploadedAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(cert.fileUrl, "_blank")}
              >
                Xem
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
