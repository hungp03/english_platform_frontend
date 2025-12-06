"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, CreditCard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useCartStore } from "@/store/cart-store"
import { useEnrollmentStore } from "@/store/enrollment-store"
import { formatCurrency } from "@/lib/utils"
import { createOrder } from "@/lib/api/order"

const MAX_CART_ITEMS = 10
export function CoursePurchase({ course, isEnrolled = false }) {
  const router = useRouter()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Get cart state and actions from Zustand store
  const {
    items,
    addToCart: addToCartStore,
    isInCart,
    fetchCart
  } = useCartStore()

  const fetchEnrollments = useEnrollmentStore((state) => state.fetchEnrollments)

  const handleAddToCart = async () => {
    // Check if cart already has 10 items
    if (items.length >= MAX_CART_ITEMS) {
      toast.error("Giỏ hàng đã đầy", {
        description: `Giỏ hàng của bạn đã có tối đa ${MAX_CART_ITEMS} khóa học. Vui lòng xóa một số khóa học để thêm mới.`,
      })
      return
    }

    setIsAddingToCart(true)

    try {
      const result = await addToCartStore(course.id)

      if (result.success) {
        toast.success("Đã thêm khóa học vào giỏ hàng", {
          description: course.title,
        })
      } else {
        toast.error("Không thể thêm vào giỏ hàng", {
          description: result.error,
        })
      }
    } catch (error) {
      console.error("Add to cart error:", error)
      toast.error("Lỗi khi thêm vào giỏ hàng", {
        description: "Vui lòng thử lại sau",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleEnrollFreeCourse = async () => {
    setIsEnrolling(true)

    try {
      const orderRequest = {
        orderSource: "DIRECT",
        items: [
          {
            entityType: "COURSE",
            entityId: course.id
          }
        ]
      }

      const result = await createOrder(orderRequest)

      if (result.success) {
        setShowConfirmDialog(false)
        toast.success("Đã tham gia khóa học thành công!")
        await fetchEnrollments()
        router.push("/my-courses/learning")
      } else {
        toast.error("Không thể tham gia khóa học", {
          description: result.error,
        })
      }
    } catch (error) {
      console.error("Enroll free course error:", error)
      toast.error("Lỗi khi tham gia khóa học", {
        description: "Vui lòng thử lại sau",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  // Only fetch cart if it's empty (cart is already loaded globally)
  useEffect(() => {
    if (items.length === 0) {
      fetchCart()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate if add to cart should be disabled
  const isAlreadyInCart = isInCart(course.id)
  const isCartFull = items.length >= MAX_CART_ITEMS
  const isDisabled = isAddingToCart || isAlreadyInCart || isCartFull

  // Get button text and tooltip based on state
  const getButtonText = () => {
    if (isAddingToCart) return "Đang thêm..."
    if (isAlreadyInCart) return "Đã có trong giỏ"
    if (isCartFull) return "Giỏ hàng đã đầy"
    return "Thêm vào giỏ hàng"
  }

  const getButtonTooltip = () => {
    if (isAlreadyInCart) return "Khóa học này đã có trong giỏ hàng của bạn"
    if (isCartFull) return `Giỏ hàng đã có tối đa ${MAX_CART_ITEMS} khóa học`
    return null
  }

  // If user is already enrolled, show different UI
  if (isEnrolled) {
    return (
      <Card className="sticky top-4">
        <CardContent className="p-6">
          <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200">
            <p className="text-sm font-medium text-green-800 mb-1">
              ✓ Bạn đã đăng ký khóa học này
            </p>
            <p className="text-xs text-green-600">
              Bạn có thể truy cập toàn bộ nội dung khóa học
            </p>
          </div>

          <Link href="/my-courses/learning">
            <Button className="w-full" size="lg">
              Vào học ngay
            </Button>
          </Link>

          <div className="mt-6 pt-6 border-t">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Truy cập trọn đời</li>
              <li>✓ Hỗ trợ tận tâm</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Giá khóa học</p>
          <p className="text-3xl font-bold text-primary">
            {course.priceCents === 0 ? "Miễn phí" : formatCurrency(course.priceCents, course.currency)}
          </p>
        </div>

        {/* Cart status indicator */}
        {(isAlreadyInCart || isCartFull) && (
          <div className="mb-4 p-3 rounded-md bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              {isAlreadyInCart
                ? "Khóa học này đã có trong giỏ hàng của bạn"
                : `Giỏ hàng của bạn đã có tối đa ${MAX_CART_ITEMS} khóa học`
              }
            </p>
          </div>
        )}

        <div className="space-y-3">
          {course.priceCents === 0 ? (
            <Button
              className="w-full"
              size="lg"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isEnrolling}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {isEnrolling ? "Đang xử lý..." : "Tham gia ngay"}
            </Button>
          ) : (
            <>
              <Link href={`/payment/checkout/${course.id}`}>
                <Button
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Mua ngay
                </Button>
              </Link>

              <Button
                variant={isAlreadyInCart ? "secondary" : "outline"}
                className={`w-full mt-2 ${isAlreadyInCart ? "bg-green-50 border-green-200 text-green-700" : ""}`}
                size="lg"
                onClick={handleAddToCart}
                disabled={isDisabled}
                title={getButtonTooltip()}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {getButtonText()}
              </Button>
            </>
          )}
        </div>

        <div className="mt-6 pt-6 border-t">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Truy cập trọn đời</li>
            <li>✓ Hỗ trợ tận tâm</li>
          </ul>
        </div>
      </CardContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận tham gia khóa học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn tham gia khóa học <strong>{course.title}</strong> không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEnrolling}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnrollFreeCourse} disabled={isEnrolling}>
              {isEnrolling ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
