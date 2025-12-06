"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS_AND_CHARS } from "@/components/ui/input-otp"
import { ArrowLeft } from "lucide-react"

export default function OtpStep({ email, otp, setOtp, onSubmit, resendTimer, handleResend, backToEmail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Xác minh mã</CardTitle>
        <CardDescription className="text-center">
          Mã OTP đã gửi tới {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(val) => setOtp(val.replace(/[^A-Za-z0-9]/g, ""))}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS.source}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button type="submit" disabled={otp.length !== 6} className="w-full bg-blue-600 text-white hover:bg-blue-500">
            Xác nhận mã
          </Button>
        </form>
        <div className="mt-4 text-center space-y-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0}
            className={`text-sm font-medium ${
              resendTimer > 0 ? "text-gray-400" : "text-blue-600 hover:text-blue-500"
            }`}
          >
            {resendTimer > 0 ? `Gửi lại OTP sau ${resendTimer}s` : "Chưa nhận được mã? Gửi lại"}
          </button>
          <div>
            <button
              type="button"
              onClick={backToEmail}
              className="text-sm text-gray-600 hover:underline flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" /> Đổi email khác
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
