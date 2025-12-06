"use client"

import { memo, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { BookOpen, Menu, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { navItems } from "@/lib/constants"
import SearchContainer from "@/components/common/search/search-container"
import AuthSection from "@/components/common/auth-section/auth-section"
import AuthSectionMobile from "@/components/common/auth-section/auth-section-mobile"
import { useCartStore } from "@/store/cart-store"
import NotificationBell from "@/components/notification/notification-bell"

const CartBadge = memo(({ count }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || count === 0 || count === undefined) {
    return <span className="sr-only">No items in cart</span>
  }

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
      {count > 99 ? '99+' : count}
    </span>
  )
})

CartBadge.displayName = "CartBadge"

const NavLinks = memo(() => {
  const pathname = usePathname()
  
  return (
    <nav className="hidden md:flex items-center space-x-8">
      {navItems.map((item) => {
        const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`text-sm font-medium transition-colors ${
              isActive 
                ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                : 'hover:text-blue-600'
            }`}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
})

NavLinks.displayName = "NavLinks"

const MobileNav = memo(({ cartItemCount }) => {
  const pathname = usePathname()
  
  return (
    <nav className="flex flex-col space-y-4 mt-8 p-4">
      {navItems.map((item) => {
        const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`text-lg font-medium transition-colors ${
              isActive 
                ? 'text-blue-600 font-bold' 
                : 'hover:text-blue-600'
            }`}
          >
            {item.name}
          </Link>
        )
      })}
      
      <Link
        href="/account/notifications"
        className={`text-lg font-medium transition-colors flex items-center gap-2 ${
          pathname === '/account/notifications' 
            ? 'text-blue-600 font-bold' 
            : 'hover:text-blue-600'
        }`}
      >
        Thông báo
      </Link>

      <Link
        href="/cart"
        className={`flex items-center space-x-3 text-lg font-medium transition-colors relative ${
          pathname === '/cart' 
            ? 'text-blue-600 font-bold' 
            : 'hover:text-blue-600'
        }`}
      >
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          <CartBadge count={cartItemCount} />
        </div>
        <span>Giỏ hàng</span>
      </Link>
      <div className="pt-4 border-t">
        <AuthSectionMobile />
      </div>
    </nav>
  )
})

MobileNav.displayName = "MobileNav"

export default function Header() {
  const { getCartItemCount } = useCartStore()
  const cartItemCount = getCartItemCount()

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">English Pro</span>
          </Link>

          <NavLinks />

          <div className="hidden md:flex items-center space-x-2">
            <NotificationBell />
            
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              <span className="sr-only">Shopping cart</span>
              <CartBadge count={cartItemCount} />
            </Link>
            
            <div className="ml-2">
              <AuthSection />
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild suppressHydrationWarning>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <MobileNav cartItemCount={cartItemCount} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}