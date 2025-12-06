"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  BookOpen,
  FileText,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getAdminOverview, getPendingActions } from "@/lib/api/admin-overview";

import StatCard from "@/components/admin/dashboard/stat-card";
import DashboardSkeleton from "@/components/admin/dashboard/dashboard-skeleton";
import PendingActionsSection from "@/components/admin/dashboard/pending-actions-section";
import UserGrowthChart from "@/components/admin/dashboard/user-growth-chart";
import RevenueChart from "@/components/admin/dashboard/revenue-chart";
import EnrollmentChart from "@/components/admin/dashboard/enrollment-chart";
import DetailedStatsGrid from "@/components/admin/dashboard/detailed-stats-grid";
import TopPerformersSection from "@/components/admin/dashboard/top-performers-section";
import ContentForumSection from "@/components/admin/dashboard/content-forum-section";
import ExportCSVSection from "@/components/admin/dashboard/export-csv-section";

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [pendingActions, setPendingActions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Get Overview Summary
        const overviewRes = await getAdminOverview();
        console.log("Overview response:", overviewRes);

        if (!overviewRes.success) {
          throw new Error(overviewRes.error || "Failed to fetch overview");
        }

        // Unwrap data - handle both { data: {...} } and { data: { data: {...} } }
        const apiData = overviewRes?.data?.data ?? overviewRes?.data;
        
        if (!apiData) {
          throw new Error("Invalid API response format");
        }

        if (mounted) {
          setOverview(mapOverviewData(apiData));
        }

        // 2. Get Pending Actions
        const pendingRes = await getPendingActions();
        if (pendingRes.success && mounted) {
          const pendingData = pendingRes?.data?.data ?? pendingRes?.data;
          setPendingActions(pendingData);
        }

      } catch (err) {
        console.error("Dashboard error:", err);
        if (mounted) {
          setError(err.message || "Không thể tải dữ liệu dashboard");
        }
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

  function mapOverviewData(payload) {
    const d = payload || {};

    return {
      users: {
        total: Number(d.users?.total ?? 0),
        active: Number(d.users?.active ?? 0),
        verified: Number(d.users?.verified ?? 0),
        inactive: Number(d.users?.inactive ?? 0),
        weekGrowth: Number(d.users?.weekGrowth ?? 0),
        activePercentage: Number(d.users?.activePercentage ?? 0),
        verifiedPercentage: Number(d.users?.verifiedPercentage ?? 0),
      },

      instructors: {
        total: Number(d.instructors?.totalInstructors ?? 0),
        pendingRequests: Number(d.instructors?.pendingRequests ?? 0),
        pendingOver7Days: Number(d.instructors?.pendingOver7Days ?? 0),
        pendingUnder3Days: Number(d.instructors?.pendingUnder3Days ?? 0),
        pending3To7Days: Number(d.instructors?.pending3To7Days ?? 0),
      },

      courses: {
        total: Number(d.courses?.totalCourses ?? 0),
        published: Number(d.courses?.published ?? 0),
        draft: Number(d.courses?.draft ?? 0),
        archived: Number(d.courses?.archived ?? 0),
        totalModules: Number(d.courses?.totalModules ?? 0),
        totalLessons: Number(d.courses?.totalLessons ?? 0),
        freeLessons: Number(d.courses?.freeLessons ?? 0),
        publishedPercentage: Number(d.courses?.publishedPercentage ?? 0),
        freeLessonsPercentage: Number(d.courses?.freeLessonsPercentage ?? 0),
      },

      quizzes: {
        total: Number(d.quizzes?.totalQuizzes ?? 0),
        byReading: Number(d.quizzes?.byReading ?? 0),
        byListening: Number(d.quizzes?.byListening ?? 0),
        byWriting: Number(d.quizzes?.byWriting ?? 0),
        bySpeaking: Number(d.quizzes?.bySpeaking ?? 0),
        totalQuestions: Number(d.quizzes?.totalQuestions ?? 0),
        published: Number(d.quizzes?.published ?? 0),
        draft: Number(d.quizzes?.draft ?? 0),
      },

      revenue: {
        totalCentsThisMonth: Number(d.revenue?.totalCentsThisMonth ?? 0),
        currency: d.revenue?.currency ?? "VND",
        growthPercentage: Number(d.revenue?.growthPercentage ?? 0),
        totalCentsVND: Number(d.revenue?.totalCentsVND ?? 0),
        totalCentsUSD: Number(d.revenue?.totalCentsUSD ?? 0),
        vndPercentage: Number(d.revenue?.vndPercentage ?? 0),
        usdPercentage: Number(d.revenue?.usdPercentage ?? 0),
      },

      orders: {
        totalThisMonth: Number(d.orders?.totalOrdersThisMonth ?? 0),
        completed: Number(d.orders?.completed ?? 0),
        pending: Number(d.orders?.pending ?? 0),
        cancelled: Number(d.orders?.cancelled ?? 0),
        unpaidCarts: Number(d.orders?.unpaidCarts ?? 0),
        completedPercentage: Number(d.orders?.completedPercentage ?? 0),
        averageOrderValue: Number(d.orders?.averageOrderValue ?? 0),
      },

      payments: {
        totalPayments: Number(d.payments?.totalPayments ?? 0),
        byPayPal: Number(d.payments?.byPayPal ?? 0),
        byPayOS: Number(d.payments?.byPayOS ?? 0),
        succeeded: Number(d.payments?.succeeded ?? 0),
        failed: Number(d.payments?.failed ?? 0),
        refunded: Number(d.payments?.refunded ?? 0),
        successRate: Number(d.payments?.successRate ?? 0),
        payPalPercentage: Number(d.payments?.payPalPercentage ?? 0),
        payOSPercentage: Number(d.payments?.payOSPercentage ?? 0),
      },

      learning: {
        totalEnrollments: Number(d.learning?.totalEnrollments ?? 0),
        completed: Number(d.learning?.completed ?? 0),
        suspended: Number(d.learning?.suspended ?? 0),
        averageProgress: Number(d.learning?.averageProgress ?? 0),
        totalAttempts: Number(d.learning?.totalAttempts ?? 0),
        attemptsCompleted: Number(d.learning?.attemptsCompleted ?? 0),
        attemptsInProgress: Number(d.learning?.attemptsInProgress ?? 0),
        attemptsGrading: Number(d.learning?.attemptsGrading ?? 0),
        averageScore: Number(d.learning?.averageScore ?? 0),
      },

      content: {
        totalBlogPosts: Number(d.content?.totalBlogPosts ?? 0),
        publishedPosts: Number(d.content?.publishedPosts ?? 0),
        draftPosts: Number(d.content?.draftPosts ?? 0),
        totalCategories: Number(d.content?.totalCategories ?? 0),
        totalComments: Number(d.content?.totalComments ?? 0),
        totalThreads: Number(d.content?.totalThreads ?? 0),
        totalForumPosts: Number(d.content?.totalForumPosts ?? 0),
        totalViews: Number(d.content?.totalViews ?? 0),
        lockedThreads: Number(d.content?.lockedThreads ?? 0),
      },
    };
  }

  if (loading) return <DashboardSkeleton />;

  if (!overview) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Không có dữ liệu để hiển thị.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Tổng quan Admin</h1>
        <p className="text-muted-foreground">
          Theo dõi hiệu suất hệ thống và hoạt động người dùng
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Người dùng"
          value={overview.users.total}
          change={`+${overview.users.weekGrowth} tuần này`}
          Icon={Users}
          trend="up"
        />
        {/* <StatCard
          title="Đang hoạt động"
          value={overview.users.active}
          change={`${overview.users.activePercentage}%`}
          Icon={Activity}
          trend="neutral"
        /> */}
        <StatCard
          title="Giảng viên"
          value={overview.instructors.total}
          change={`${overview.instructors.pendingRequests} chờ duyệt`}
          Icon={GraduationCap}
          trend={overview.instructors.pendingRequests > 0 ? "warning" : "neutral"}
        />
        <StatCard
          title="Khóa học"
          value={overview.courses.total}
          change={`${overview.courses.published} đã xuất bản`}
          Icon={BookOpen}
          trend="up"
        />
        <StatCard
          title="Đề thi"
          value={overview.quizzes.total}
          change={`${overview.quizzes.totalQuestions} câu hỏi`}
          Icon={FileText}
          trend="neutral"
        />
        <StatCard
          title="Doanh thu tháng"
          value={`${(overview.revenue.totalCentsThisMonth || 0).toLocaleString()} ${overview.revenue.currency}`}
          change={`${overview.revenue.growthPercentage >= 0 ? "+" : ""}${overview.revenue.growthPercentage}%`}
          Icon={DollarSign}
          trend={overview.revenue.growthPercentage >= 0 ? "up" : "down"}
        />
      </div>

      {/* Pending Actions Alert */}
      {pendingActions && (
        <PendingActionsSection pendingActions={pendingActions} />
      )}

      {/* Export CSV Section */}
      <ExportCSVSection />

      {/* Charts Section */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="enrollment">Đăng ký</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserGrowthChart />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueChart />
        </TabsContent>

        <TabsContent value="enrollment" className="space-y-4">
          <EnrollmentChart />
        </TabsContent>
      </Tabs>

      {/* Detailed Statistics Grid */}
      <DetailedStatsGrid overview={overview} />

      {/* Top Performers */}
      <TopPerformersSection />

      {/* Content & Forum */}
      <ContentForumSection overview={overview} />
    </div>
  );
}