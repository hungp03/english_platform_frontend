"use client"

import { memo, useCallback } from "react"
import Link from "next/link"
import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"

const CartItem = memo(({ item, onRemove, removingItems }) => {
  const isPurchased = item.course.isPurchased
  const isRemoving = removingItems.has(item.course.id)

  const handleRemove = useCallback(() => {
    onRemove(item.course.id, item.course.title)
  }, [item.course.id, item.course.title, onRemove])

  return (
    <div className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-lg transition-colors ${
      isPurchased
        ? 'opacity-60 bg-gray-50 border-gray-300'
        : 'hover:bg-gray-50'
    }`}>
      <div className="flex-shrink-0">
        <Avatar className={`h-16 w-16 ${isPurchased ? 'grayscale' : ''}`}>
          <AvatarFallback className={isPurchased ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}>
            {item.course.title.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-grow">
            <h3 className={`font-semibold mb-1 ${isPurchased ? 'text-gray-500' : 'text-gray-900'}`}>
              {isPurchased ? (
                <span className="line-clamp-1">{item.course.title}</span>
              ) : (
                <Link
                  href={`/courses/${item.course.slug}`}
                  className="hover:text-blue-600 transition-colors line-clamp-1"
                >
                  {item.course.title}
                </Link>
              )}
            </h3>
            <p className={`text-sm mb-2 line-clamp-2 ${isPurchased ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.course.description}
            </p>

            {isPurchased && (
              <div className="mb-2">
                <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                  Đã mua
                </Badge>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <Badge variant="secondary">
                {item.course.language?.toUpperCase() || 'N/A'}
              </Badge>
              <span>Giảng viên: {item.course.instructorName}</span>
              <span>Thêm vào: {new Date(item.addedAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between gap-2">
            {!isPurchased && (
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(item.course.priceCents, item.course.currency)}
                </p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="ml-1 hidden sm:inline">Xóa</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})

CartItem.displayName = "CartItem"

export default CartItem