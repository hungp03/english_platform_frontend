"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {FullPageLoader} from "@/components/ui/full-page-loader"
import { verifyRegister } from "@/lib/api/auth"

export function VerifyRegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      toast.error("Thiếu token xác thực.")
      router.replace("/")
      return
    }

    const verify = async () => {
      const res = await verifyRegister(token)
      if (res.success) {
        toast.success("Xác thực email thành công! Bạn có thể đăng nhập.")
        router.replace("/login")
      } else {
        toast.error(res.error || "Token không hợp lệ.")
        router.replace("/")
      }
    }

    verify()
  }, [token, router])

  return <FullPageLoader />
}
