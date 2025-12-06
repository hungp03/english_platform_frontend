"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FullPageLoader } from "@/components/ui/full-page-loader"
import { setCookie } from "@/lib/api/auth"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthLogin = useAuthStore((s) => s.oauthLogin)

  useEffect(() => {
    const run = async () => {
      try {
        const access_token = searchParams.get("access_token")
        const refresh_token = searchParams.get("refresh_token")

        if (!access_token || !refresh_token) {
          throw new Error("Missing tokens")
        }

        await setCookie(access_token, refresh_token)
        await oauthLogin()

        toast.success("Đăng nhập thành công!")
        setTimeout(() => router.replace("/"), 1000)
      } catch (e) {
        console.error("OAuth callback error:", e)
        toast.error("Đăng nhập thất bại")
        router.replace("/login")
      }
    }
    run()
  }, [router, searchParams, oauthLogin])

  return <FullPageLoader />
}

export default function CallbackSuccess() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <CallbackContent />
    </Suspense>
  )
}
