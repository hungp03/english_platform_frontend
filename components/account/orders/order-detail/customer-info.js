import { memo } from "react"
import { User, Mail } from "lucide-react"

export const CustomerInfo = memo(function CustomerInfo({ orderDetails }) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <User className="w-4 h-4" />
        Thông tin người mua
      </h3>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="font-medium">{orderDetails.user.fullName}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Mail className="w-3.5 h-3.5" />
          <span className="break-all">{orderDetails.user.email}</span>
        </div>
      </div>
    </div>
  )
})