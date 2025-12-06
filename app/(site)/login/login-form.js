"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, Eye, EyeOff } from "lucide-react"
import {FullPageLoader} from "@/components/ui/full-page-loader"
import { loginSchema } from "@/schema/login"
import { useAuthStore } from "@/store/auth-store"

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const loginUser = useAuthStore((s) => s.loginUser)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  })

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const onSubmit = useCallback(async (values) => {
    setLoading(true)
    try {
      const res = await loginUser(values.identifier, values.password)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Đăng nhập thành công!")
        router.push("/")
      }
    } catch {
      toast.error("Có lỗi kết nối server")
    } finally {
      setLoading(false)
    }
  }, [loginUser, router]);

  return (
    <>
      {loading && <FullPageLoader />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Identifier */}
        <div>
          <Label htmlFor="identifier">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="identifier"
              placeholder="Nhập email của bạn"
              className="pl-10"
              {...register("identifier")}
            />
          </div>
          {errors.identifier && (
            <p className="text-sm text-red-600 mt-1">{errors.identifier.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              className="pl-10 pr-10"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={togglePassword}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot password */}
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-blue-600 text-white hover:bg-blue-500"
          disabled={loading}
        >
          {loading ? "Đang xử lý…" : "Đăng nhập"}
        </Button>
      </form>
    </>
  )
}
