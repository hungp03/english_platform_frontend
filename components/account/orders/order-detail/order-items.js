import { memo } from "react"
import { formatCurrency } from "@/lib/utils"
import { BookOpen, ShoppingBag } from "lucide-react"

const OrderItem = memo(function OrderItem({ item }) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-b-0">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/5 rounded-lg shrink-0 flex items-center justify-center">
        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary/40" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm sm:text-base line-clamp-2" title={item.title}>
          {item.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
            {item.entityType === "COURSE" ? "Khóa học" : item.entityType}
          </span>
          <span className="text-xs text-muted-foreground">x{item.quantity}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="font-semibold text-sm sm:text-base text-primary">
          {item.unitPriceCents === 0 ? "Miễn phí" : formatCurrency(item.unitPriceCents)}
        </span>
      </div>
    </div>
  )
})

export const OrderItems = memo(function OrderItems({ orderDetails }) {
  return (
    <div className="bg-background rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-medium flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Sản phẩm đã mua
          <span className="text-xs text-muted-foreground">({orderDetails.items?.length || 0} sản phẩm)</span>
        </h3>
      </div>
      <div className="px-4">
        {orderDetails.items?.map((item) => (
          <OrderItem key={item.id} item={item} />
        ))}
      </div>
      <div className="px-4 py-3 bg-muted/20 border-t">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Tổng thanh toán:</span>
          <span className="text-xl font-bold text-primary">
            {orderDetails.totalCents === 0 ? "Miễn phí" : formatCurrency(orderDetails.totalCents)}
          </span>
        </div>
      </div>
    </div>
  )
})