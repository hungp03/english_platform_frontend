import { useState, useEffect } from "react"
import { getOrders } from "@/lib/api/order"

export function useOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        pages: 1,
        total: 0
    })

    // Filter states
    const [statusFilter, setStatusFilter] = useState("all")
    const [dateFilter, setDateFilter] = useState({ from: null, to: null })
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)

    // Load orders from API
    const loadOrders = async () => {
        setLoading(true)
        setError(null)

        try {
            const params = {
                page: currentPage,
                size: pageSize,
                sort: "createdAt,desc"
            }

            // Add filters
            if (statusFilter !== "all") {
                params.status = statusFilter
            }

            if (dateFilter.from) {
                params.startDate = dateFilter.from.toISOString()
            }

            if (dateFilter.to) {
                params.endDate = dateFilter.to.toISOString()
            }

            const result = await getOrders(params)

            if (result.success) {
                setOrders(result.data.result || [])
                setPagination(result.data.meta || {
                    page: currentPage,
                    pageSize: pageSize,
                    pages: 1,
                    total: 0
                })
            } else {
                setError(result.error || "Không thể tải danh sách đơn hàng")
                setOrders([])
            }
        } catch (err) {
            console.error("Load orders error:", err)
            setError("Có lỗi xảy ra khi tải danh sách đơn hàng")
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    // Load orders on component mount and when filters change
    useEffect(() => {
        loadOrders()
    }, [currentPage, pageSize, statusFilter, dateFilter])

    const clearFilters = () => {
        setStatusFilter("all")
        setDateFilter({ from: null, to: null })
        setCurrentPage(1)
    }

    return {
        orders,
        loading,
        error,
        pagination,
        statusFilter,
        setStatusFilter,
        dateFilter,
        setDateFilter,
        currentPage,
        setCurrentPage,
        loadOrders,
        clearFilters
    }
}
