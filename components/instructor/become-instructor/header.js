import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const Header = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trở thành giảng viên</h1>
          <p className="text-gray-600 mt-2">Chia sẻ kiến thức và tạo ảnh hưởng đến hàng ngàn học viên</p>
        </div>
        <Link href="/account">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
      </div>
    </div>
  )
}