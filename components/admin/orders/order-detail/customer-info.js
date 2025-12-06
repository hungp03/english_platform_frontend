import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"

export function CustomerInfo({ user }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    Thông tin khách hàng
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <p className="text-xs sm:text-sm text-gray-600">Họ tên</p>
                        <p className="font-medium text-sm sm:text-base">{user?.fullName || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-gray-600">Email</p>
                        <p className="font-medium text-sm sm:text-base break-all">{user?.email || "N/A"}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
