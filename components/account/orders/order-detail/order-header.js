import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, CheckCircle, XCircle } from "lucide-react"

const StatusStep = memo(function StatusStep({ icon: Icon, label, isActive, isCompleted, isLast }) {
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isCompleted ? "bg-primary text-primary-foreground" : 
          isActive ? "bg-primary/20 text-primary border-2 border-primary" : 
          "bg-muted text-muted-foreground"
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={`text-xs mt-1 text-center whitespace-nowrap ${
          isActive || isCompleted ? "text-primary font-medium" : "text-muted-foreground"
        }`}>
          {label}
        </span>
      </div>
      {!isLast && (
        <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 mb-5 ${
          isCompleted ? "bg-primary" : "bg-muted"
        }`} />
      )}
    </div>
  )
})

export const OrderHeader = memo(function OrderHeader({ orderDetails, statusConfig }) {
  const isCancelled = orderDetails.status === "CANCELLED"
  const isPaid = orderDetails.status === "PAID"
  const isPending = orderDetails.status === "PENDING"

  return (
    <div className="bg-background rounded-lg shadow-sm overflow-hidden">
      {/* Status Banner */}
      <div className={`px-4 py-3 ${
        isPaid ? "bg-green-50 border-b border-green-100" :
        isCancelled ? "bg-red-50 border-b border-red-100" :
        "bg-primary/5 border-b border-primary/10"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPaid ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : isCancelled ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Clock className="w-5 h-5 text-primary" />
            )}
            <span className={`font-semibold ${
              isPaid ? "text-green-700" :
              isCancelled ? "text-red-700" :
              "text-primary"
            }`}>
              {statusConfig.text}
            </span>
          </div>
          <Badge variant={statusConfig.variant} className="text-xs">
            {orderDetails.id}
          </Badge>
        </div>
      </div>

      {/* Progress Steps - Only show for non-cancelled orders */}
      {!isCancelled && (
        <div className="px-4 py-4 flex justify-center">
          <div className="flex items-start">
            <StatusStep 
              icon={Package} 
              label="Đặt hàng" 
              isActive={isPending} 
              isCompleted={isPaid}
            />
            <StatusStep 
              icon={Clock} 
              label="Chờ thanh toán" 
              isActive={isPending}
              isCompleted={isPaid}
            />
            <StatusStep 
              icon={CheckCircle} 
              label="Hoàn thành" 
              isActive={isPaid}
              isCompleted={isPaid}
              isLast
            />
          </div>
        </div>
      )}
    </div>
  )
})