import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ArrowUpDown } from "lucide-react"
import ScheduleCard from "./schedule-card"
import { Pagination } from "@/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function SchedulesList({
    studyPlans,
    pagination,
    onPageChange,
    sortValue,
    onSortChange,
    onEdit,
    onDelete
}) {
    if (!studyPlans || studyPlans.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Chưa có lịch học nào
                    </h3>
                    <p className="text-gray-600">
                        Bạn chưa có nhắc nhở học tập nào được tạo
                    </p>
                </CardContent>
            </Card>
        )
    }

    const sortOptions = [
        { value: "createdAt,asc", label: "Ngày tạo: Cũ nhất" },
        { value: "createdAt,desc", label: "Ngày tạo: Mới nhất" },
        { value: "updatedAt,asc", label: "Ngày cập nhật: Cũ nhất" },
        { value: "updatedAt,desc", label: "Ngày cập nhật: Mới nhất" },
    ]

    return (
        <div className="space-y-6">
            {/* Sort selector */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {pagination && (
                        <span>
                            Hiển thị <strong>{studyPlans.length}</strong> nhắc nhở học tập
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Sắp xếp:</span>
                    <Select value={sortValue} onValueChange={onSortChange}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Chọn cách sắp xếp" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                {studyPlans.map((plan) => (
                    <ScheduleCard
                        key={plan.id}
                        studyPlan={plan}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            {pagination && pagination.pages > 1 && (
                <div className="mt-8">
                    <Pagination
                        totalPages={pagination.pages}
                        currentPage={pagination.page}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    )
}
