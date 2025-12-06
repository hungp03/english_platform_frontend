"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {FullPageLoader} from "@/components/ui/full-page-loader"
import { forgotPassword, verifyOtp, resetPassword } from "@/lib/api/auth"

import EmailStep from "./steps/email-step"
import OtpStep from "./steps/otp-step"
import ResetStep from "./steps/reset-step"

export default function ForgotForm() {
  const router = useRouter()
  const [step, setStep] = useState("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [identifyCode, setIdentifyCode] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" })

  // resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setInterval(() => setResendTimer((s) => s - 1), 1000)
      return () => clearInterval(t)
    }
  }, [resendTimer])

  const handleResend = async () => {
    if (resendTimer > 0) return
    setLoading(true)
    try {
      const res = await forgotPassword(email)
      if (res?.success) {
        setResendTimer(60)
        toast.success("OTP mới đã được gửi")
      } else {
        toast.error(res.error || "Không thể gửi lại OTP.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await forgotPassword(email)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Mã xác thực đã gửi về email.")
      setStep("otp")
    }
    setLoading(false)
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) return
    setLoading(true)
    const res = await verifyOtp(email, otp)
    if (res.error) {
      toast.error(res.error)
    } else {
      // backend trả identifyCode
      setIdentifyCode(res.data?.data?.identifyCode)
      toast.success("Xác thực thành công.")
      setStep("reset")
    }
    setLoading(false)
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.")
      return
    }
    setLoading(true)
    const res = await resetPassword(
      email,
      formData.newPassword,
      formData.confirmPassword,
      identifyCode
    )
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Đặt lại mật khẩu thành công.")
      router.push("/login")
    }
    setLoading(false)
  }
  
  return (
    <>
      {loading && <FullPageLoader />}
      <div className="w-full max-w-xl space-y-8">
        {step === "email" && (
          <EmailStep
            email={email}
            setEmail={setEmail}
            onSubmit={handleEmailSubmit}
          />
        )}
        {step === "otp" && (
          <OtpStep
            email={email}
            otp={otp}
            setOtp={setOtp}
            onSubmit={handleOtpSubmit}
            resendTimer={resendTimer}
            handleResend={handleResend}
            backToEmail={() => setStep("email")}
          />
        )}
        {step === "reset" && (
          <ResetStep
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            onSubmit={handleResetSubmit}
          />
        )}
      </div>
    </>
  )
}
