"use client"

import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { register as registerApi } from "@/lib/api/auth"
import {FullPageLoader} from "@/components/ui/full-page-loader"
import { registerSchema } from "@/schema/register"

export default function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agree, setAgree] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  })

  const togglePassword = useCallback(() => setShowPassword(prev => !prev), []);
  const toggleConfirmPassword = useCallback(() => setShowConfirmPassword(prev => !prev), []);
  const toggleAgree = useCallback(() => setAgree(prev => !prev), []);

  const onSubmit = useCallback(async (values) => {
    if (!agree) {
      toast.error("Bạn cần đồng ý với Điều khoản và Chính sách trước.")
      return
    }

    setIsLoading(true)
    try {
      const res = await registerApi(values.fullName, values.email, values.password, values.confirmPassword)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email.")
        router.push("/login")
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }, [agree, router]);

  return (
    <>
      {isLoading && <FullPageLoader />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="mb-1">Tên</Label>
          <Input
            id="fullName"
            placeholder="Nhập họ và tên"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="mb-1">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Nhập email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="mb-1">Mật khẩu</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              className="pr-10"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
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

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword" className="mb-1">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              className="pr-10"
              {...register("confirmPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Agree to terms */}
        <div className="flex items-center space-x-2">
          <Checkbox id="agree" checked={agree} onCheckedChange={(v) => setAgree(!!v)} />
          <Label htmlFor="agree" className="text-sm">
            Tôi đồng ý với{" "}
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Điều khoản
            </Link>{" "}
            và{" "}
            <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Chính sách bảo mật
            </Link>
          </Label>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-500" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
        </Button>
      </form>
    </>
  )
}
