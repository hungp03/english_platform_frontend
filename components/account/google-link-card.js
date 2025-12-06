"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGoogleLogin } from "@react-oauth/google"
import { linkGoogleAccount, unlinkGoogleAccount } from "@/lib/api/google-auth"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"
import { CheckCircle2, Link as LinkIcon, Unlink, Calendar } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function GoogleLinkCard() {
    const [isLinking, setIsLinking] = useState(false)
    const [isUnlinking, setIsUnlinking] = useState(false)
    const { user, fetchUser } = useAuthStore()

    const isLinked = user?.provider === "GOOGLE"

    const googleLogin = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            setIsLinking(true)

            try {
                // Send authorization code to backend
                const result = await linkGoogleAccount(codeResponse.code)

                if (result.success) {
                    toast.success("Liên kết tài khoản Google thành công!")
                    // Refresh user data from server
                    await fetchUser(true)
                } else {
                    toast.error(result.error || "Không thể liên kết tài khoản Google")
                }
            } catch (error) {
                console.error("Link Google error:", error)
                toast.error("Đã xảy ra lỗi khi liên kết tài khoản")
            } finally {
                setIsLinking(false)
            }
        },
        onError: () => {
            toast.error("Đăng nhập Google thất bại")
            setIsLinking(false)
        },
        flow: "auth-code",
        scope: "openid email profile https://www.googleapis.com/auth/calendar"
    })

    const handleUnlink = async () => {
        setIsUnlinking(true)

        try {
            const result = await unlinkGoogleAccount()

            if (result.success) {
                toast.success("Hủy liên kết tài khoản Google thành công!")
                // Refresh user data from server
                await fetchUser(true)
            } else {
                toast.error(result.error || "Không thể hủy liên kết tài khoản Google")
            }
        } catch (error) {
            console.error("Unlink Google error:", error)
            toast.error("Đã xảy ra lỗi khi hủy liên kết tài khoản")
        } finally {
            setIsUnlinking(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Liên kết tài khoản Google
                </CardTitle>
                <CardDescription>
                    Liên kết với Google để đăng nhập dễ dàng hơn
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLinked ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">
                                    Đã liên kết với Google
                                </p>
                                <p className="text-xs text-green-700 mt-1">
                                    Bạn có thể đăng nhập bằng tài khoản Google
                                </p>
                            </div>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    disabled={isUnlinking}
                                >
                                    <Unlink className="h-4 w-4 mr-2" />
                                    {isUnlinking ? "Đang hủy liên kết..." : "Hủy liên kết"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận hủy liên kết</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bạn có chắc chắn muốn hủy liên kết tài khoản Google?
                                        Sau khi hủy, bạn sẽ không thể đăng nhập bằng Google nữa.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleUnlink}>
                                        Xác nhận
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                Liên kết tài khoản Google của bạn để có thể đăng nhập nhanh chóng mà không cần nhập mật khẩu.
                            </p>
                            <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                <Calendar className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <p>
                                    Ứng dụng sẽ yêu cầu quyền truy cập Google Calendar để đồng bộ lịch học tập của bạn.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => googleLogin()}
                            disabled={isLinking}
                            className="w-full"
                            variant="outline"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {isLinking ? "Đang liên kết..." : "Liên kết với Google"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
