import { Suspense } from "react"
import { VerifyRegisterPage } from "./verify-register-page"

export const metadata = {
  title: "Đăng ký - English Pro",
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<p>Đang tải...</p>}>
      <VerifyRegisterPage />
    </Suspense>
  )
}
