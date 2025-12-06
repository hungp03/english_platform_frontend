"use client"

import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export function ResultIcon({ status, size = "large" }) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-20 h-20"
  }

  const iconClasses = cn(
    sizeClasses[size] || sizeClasses.large,
    "mx-auto"
  )

  switch (status) {
    case 'success':
      return (
        <CheckCircle
          className={cn(iconClasses, "text-green-500")}
          strokeWidth={2}
        />
      )
    case 'failure':
      return (
        <XCircle
          className={cn(iconClasses, "text-red-500")}
          strokeWidth={2}
        />
      )
    case 'cancellation':
      return (
        <AlertCircle
          className={cn(iconClasses, "text-orange-500")}
          strokeWidth={2}
        />
      )
    case 'pending':
      return (
        <Clock
          className={cn(iconClasses, "text-blue-500")}
          strokeWidth={2}
        />
      )
    default:
      return (
        <AlertCircle
          className={cn(iconClasses, "text-gray-500")}
          strokeWidth={2}
        />
      )
  }
}