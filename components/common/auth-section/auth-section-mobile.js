'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import UserDropdownMobile from "@/components/common/user-dropdown/user-dropdown-mobile"
import { useAuthStore } from "@/store/auth-store"
import { useEffect, useState } from "react"

const AuthSectionMobile = () => {
  const user = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  const isFetchingUser = useAuthStore((s) => s.isFetchingUser)

  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (hasHydrated && !isFetchingUser) {
      setReady(true)
    }
  }, [hasHydrated, isFetchingUser])

  if (!ready) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-10 w-full rounded-md bg-gray-200" />
        <div className="h-10 w-full rounded-md bg-gray-200" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-3">
        <Link href="/login">
          <Button variant="outline" className="w-full">Đăng nhập</Button>
        </Link>
        <Link href="/register">
          <Button className="w-full bg-blue-600 hover:bg-blue-500 mt-3">Đăng ký</Button>
        </Link>
      </div>
    )
  }

  return <UserDropdownMobile user={user} />
}

export default AuthSectionMobile
