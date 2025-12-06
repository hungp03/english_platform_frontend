"use client"

import {
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  BookOpen,
  ChartNoAxesGantt 
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const UserDropdownMobile = ({ user }) => {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logoutUser)

  if (!user) return null

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Bạn đã đăng xuất")
      router.push("/")
    } catch (err) {
      toast.error("Đăng xuất thất bại")
    }
  }

  return (
    <div className="flex flex-col gap-2 pt-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={user?.avatarUrl || "/default-avatar.png"}
            alt={user.fullName}
          />
          <AvatarFallback>
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm text-gray-600">
          Xin chào, <strong>{user.fullName}</strong>
        </p>
      </div>

      {user?.roles?.includes("ADMIN") && (
        <Button variant="ghost" className="justify-start w-full" asChild>
          <Link href="/admin">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Trang quản trị
          </Link>
        </Button>
      )}

      {user?.roles?.includes("INSTRUCTOR") && (
        <Button variant="ghost" className="justify-start w-full" asChild>
          <Link href="/instructor">
            <ChartNoAxesGantt className="w-4 h-4 mr-2" />
            Trang giảng viên
          </Link>
        </Button>
      )}

      <Button variant="ghost" className="justify-start w-full" asChild>
        <Link href="/my-courses/learning">
          <BookOpen className="w-4 h-4 mr-2" />
          Khóa học của tôi
        </Link>
      </Button>

      <Button variant="ghost" className="justify-start w-full" asChild>
        <Link href="/account">
          <UserIcon className="w-4 h-4 mr-2" />
          Tài khoản
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="justify-start w-full text-red-600"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Đăng xuất
      </Button>
    </div>
  )
}

export default UserDropdownMobile
