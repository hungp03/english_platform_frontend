"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"
import { ValidationPattern } from "@/lib/constants"


export default function EmailStep({ email, setEmail, onSubmit }) {
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      setError("Email không được để trống")
      return
    }
    if (!ValidationPattern.EMAIL_PATTERN.test(email)) {
      setError("Email không hợp lệ: chỉ được chứa ký tự chữ, số, ., _, -")
      return
    }
    setError("")
    onSubmit(e)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Quên mật khẩu?</CardTitle>
        <CardDescription className="text-center">
          Nhập email để nhận mã xác thực
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Email</Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                value={email}
                placeholder="Nhập email của bạn"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
                aria-invalid={!!error}
              />
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
            disabled={!email}
          >
            Gửi mã xác thực
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
