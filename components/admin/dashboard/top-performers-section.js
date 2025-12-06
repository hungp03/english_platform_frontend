"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, DollarSign } from "lucide-react";
import { getTopCourses, getTopRevenueCourses } from "@/lib/api/admin-overview";

export default function TopPerformersSection() {
  const [topCourses, setTopCourses] = useState([]);
  const [topRevenueCourses, setTopRevenueCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);

        const [topCoursesRes, topRevenueRes] = await Promise.all([
          getTopCourses(10),
          getTopRevenueCourses(10),
        ]);

        if (topCoursesRes.success && mounted) {
          const coursesData = topCoursesRes?.data?.data ?? topCoursesRes?.data;
          setTopCourses(coursesData?.topCourses || []);
        }

        if (topRevenueRes.success && mounted) {
          const revenueData = topRevenueRes?.data?.data ?? topRevenueRes?.data;
          setTopRevenueCourses(revenueData?.topRevenueCourses || []);
        }
      } catch (error) {
        console.error("Error fetching top performers:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" /> Top Khóa học (Đăng ký)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
            ) : (
              topCourses.slice(0, 5).map((course, idx) => (
                <div
                  key={course.id || idx}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{idx + 1}</Badge>
                    <div>
                      <p className="font-medium text-sm">
                        {course.title || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.enrollmentCount || 0} đăng ký
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Top Khóa học (Doanh thu)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topRevenueCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
            ) : (
              topRevenueCourses.slice(0, 5).map((course, idx) => (
                <div
                  key={course.id || idx}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{idx + 1}</Badge>
                    <div>
                      <p className="font-medium text-sm">
                        {course.title || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.totalOrders || 0} đơn hàng
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">
                    {(course.totalRevenueCents || 0).toLocaleString()} {course.currency || "VND"}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
