import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function PaymentSummary({ price, discount, total }) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Tóm tắt thanh toán</h3>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Giá gốc</span>
          <span className="font-medium">{price.toLocaleString("vi-VN")}đ</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-500">
            <span>Giảm giá</span>
            <span className="font-medium">
              -{discount.toLocaleString("vi-VN")}đ
            </span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between text-lg">
          <span className="font-bold">Tổng cộng</span>
          <span className="font-bold text-primary">
            {total.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>
    </Card>
  )
}
