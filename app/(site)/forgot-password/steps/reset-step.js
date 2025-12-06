"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"

const PASSWORD_PATTERN = /^[^\s]{8,}$/;

export default function ResetStep({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onSubmit,
}) {
  const passwordInvalid = formData.newPassword && !PASSWORD_PATTERN.test(formData.newPassword);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Đặt lại mật khẩu</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Mật khẩu mới */}
          <div>
            <Label>Mật khẩu mới</Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                placeholder="Nhập mật khẩu mới"
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                required
                className="pl-10 pr-10"
                aria-invalid={passwordInvalid}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {passwordInvalid && (
              <p className="text-sm text-red-600 mt-1">
                Mật khẩu phải tối thiểu 8 ký tự và không chứa khoảng trắng
              </p>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <Label>Xác nhận mật khẩu</Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                placeholder="Nhập lại mật khẩu"
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                className="pl-10 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {formData.newPassword &&
              formData.confirmPassword &&
              formData.newPassword !== formData.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  Mật khẩu xác nhận không khớp
                </p>
              )}
          </div>

          {/* Nút submit */}
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
            disabled={
              !formData.newPassword ||
              !PASSWORD_PATTERN.test(formData.newPassword) ||
              formData.newPassword !== formData.confirmPassword
            }
          >
            Xác nhận đặt lại mật khẩu
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-blue-600 hover:underline flex items-center gap-1 justify-center"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
