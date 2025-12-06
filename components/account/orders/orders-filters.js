"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowUpDown } from "lucide-react"

const OrdersFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy
}) => {
  const handleSortChange = (value) => {
    setSortBy(value)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search */}
      <div className="w-full lg:flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo mã đơn hàng..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
            }}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-auto">
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value)
        }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="PAID">Đã thanh toán</SelectItem>
            <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            {/* <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem> */}
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="w-full sm:w-auto">
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-48">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt,desc">Mới nhất</SelectItem>
            <SelectItem value="createdAt,asc">Cũ nhất</SelectItem>
            <SelectItem value="totalCents,desc">Giá giảm dần</SelectItem>
            <SelectItem value="totalCents,asc">Giá tăng dần</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default OrdersFilters