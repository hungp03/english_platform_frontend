"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getInstructorGrowth } from "@/lib/api/course"
import { toast } from "sonner"

export function GrowthChart() {
    const [loading, setLoading] = useState(true)
    const [growthData, setGrowthData] = useState(null)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    useEffect(() => {
        fetchGrowthData()
    }, [selectedMonth, selectedYear])

    const fetchGrowthData = async () => {
        setLoading(true)
        try {
            const result = await getInstructorGrowth(selectedMonth, selectedYear)
            if (result.success) {
                setGrowthData(result.data)
            } else {
                toast.error(result.error || "Không thể tải dữ liệu tăng trưởng")
            }
        } catch (error) {
            console.error("Error fetching growth data:", error)
            toast.error("Đã xảy ra lỗi khi tải dữ liệu")
        } finally {
            setLoading(false)
        }
    }

    const chartData = growthData?.periods?.map(period => ({
        name: period.periodLabel,
        revenue: period.revenueCents,
        students: period.studentCount,
    })) || []

    const months = [
        { value: 1, label: "Tháng 1" },
        { value: 2, label: "Tháng 2" },
        { value: 3, label: "Tháng 3" },
        { value: 4, label: "Tháng 4" },
        { value: 5, label: "Tháng 5" },
        { value: 6, label: "Tháng 6" },
        { value: 7, label: "Tháng 7" },
        { value: 8, label: "Tháng 8" },
        { value: 9, label: "Tháng 9" },
        { value: 10, label: "Tháng 10" },
        { value: 11, label: "Tháng 11" },
        { value: 12, label: "Tháng 12" },
    ]

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 3 }, (_, i) => currentYear - i)

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value)
    }

    return (
        <Card className="shadow-elegant">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Tăng trưởng theo tháng</CardTitle>
                    <div className="flex gap-2">
                        <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value.toString()}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {growthData && (
                    <div className="flex gap-6 mt-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Tổng doanh thu</p>
                            <p className="text-lg font-semibold">{growthData.formattedTotalRevenue}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Tổng học viên</p>
                            <p className="text-lg font-semibold">{growthData.totalStudents}</p>
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : chartData.length > 0 ? (
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-sm font-medium mb-4">Doanh thu</h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu (VND)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium mb-4">Học viên mới</h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} name="Học viên" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">Không có dữ liệu</p>
                )}
            </CardContent>
        </Card>
    )
}
