"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getEnrollmentChart } from "@/lib/api/admin-overview";

export default function EnrollmentChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const enrollmentRes = await getEnrollmentChart(6);
        if (enrollmentRes.success && mounted) {
          const enrollData = enrollmentRes?.data?.data ?? enrollmentRes?.data;
          setData(enrollData?.monthlyEnrollment || []);
        }
      } catch (error) {
        console.error("Error fetching enrollment chart:", error);
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
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký khóa học (6 tháng)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký khóa học (6 tháng)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="newEnrollments"
              stroke="#8884d8"
              name="Đăng ký mới"
            />
            <Line
              type="monotone"
              dataKey="completedEnrollments"
              stroke="#82ca9d"
              name="Đã hoàn thành"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
