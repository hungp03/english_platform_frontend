"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { getMyOrders } from "@/lib/api/order"
import { toast } from "sonner"
import Link from "next/link"
import OrdersFilters from "@/components/account/orders/orders-filters"
import OrdersTable from "@/components/account/orders/orders-table"
import OrderCard from "@/components/account/orders/order-card"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState("createdAt,desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    pageSize: 10,
    pages: 1,
    total: 0
  })

  const ordersPerPage = 10

  // Fetch orders from API
  const fetchOrders = useCallback(async (page = 1, sort = "createdAt,desc") => {
    try {
      setLoading(true)
      const result = await getMyOrders(page, ordersPerPage, sort)

      if (result.success) {
        setOrders(result.data.result || [])
        setPaginationMeta(result.data.meta || {
          page: 1,
          pageSize: ordersPerPage,
          pages: 1,
          total: 0
        })
      } else {
        toast.error(result.error || "Không thể tải danh sách đơn hàng")
        setOrders([])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Có lỗi xảy ra khi tải đơn hàng")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load and when page/sort changes
  useEffect(() => {
    fetchOrders(currentPage, sortBy)
  }, [currentPage, sortBy, fetchOrders])

  // Filter orders (client-side filtering for search and status)
  const filteredOrders = useMemo(() => {
    if (!orders.length) return []

    return orders.filter(order => {
      const matchesSearch = searchTerm === "" ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  // Pagination is handled by API, so we just use the filtered results
  const paginatedOrders = filteredOrders
  const totalPages = paginationMeta.pages

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
              <Link href="/account">
                <Button variant="outline">
                  Quay lại tài khoản
                </Button>
              </Link>
            </div>
            <p className="text-gray-600">Xem và quản lý lịch sử đơn hàng của bạn</p>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <OrdersFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />

              {/* Results count */}
              <div className="mt-4 text-sm text-gray-600">
                {loading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  `Hiển thị ${paginatedOrders.length} trên ${paginationMeta.total} đơn hàng`
                )}
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : paginatedOrders.length > 0 ? (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden">
                    <div className="divide-y">
                      {paginatedOrders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <OrdersTable orders={paginatedOrders} />
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-2">Không tìm thấy đơn hàng nào</div>
                  <div className="text-sm text-gray-400">
                    Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}