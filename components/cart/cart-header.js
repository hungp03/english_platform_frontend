"use client"

import { ShoppingCart, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CartHeader({ itemCount, onClearCart, clearingCart, hasActiveRemovals }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <ShoppingCart className="h-5 w-5" />
        <span>Khóa học ({itemCount})</span>
      </div>
      {itemCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearCart}
          disabled={clearingCart || hasActiveRemovals}
          className="text-red-600 hover:text-red-700 hover:border-red-300"
        >
          {clearingCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="ml-1 hidden sm:inline">Xóa tất cả</span>
        </Button>
      )}
    </div>
  )
}