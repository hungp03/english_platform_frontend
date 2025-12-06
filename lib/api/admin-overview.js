import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

export async function getAdminOverview() {
  try {
    const res = await api.get("/api/admin/overview/summary");
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
    }
    return { success: false, error: "Không thể lấy dữ liệu tổng quan" };
  } catch (err) {
    console.error("Admin overview error:", err);
    return { success: false, error: "Có lỗi khi lấy dữ liệu" };
  }
}

/** Lấy danh sách pending actions */
export async function getPendingActions() {
  try {
    const res = await api.get("/api/admin/overview/pending-actions");
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
    }
    return { success: false, error: "Không thể lấy pending actions" };
  } catch (err) {
    console.error("Pending actions error:", err);
    return { success: false, error: "Lỗi khi lấy pending actions" };
  }
}

/** Lấy biểu đồ tăng trưởng người dùng */
export async function getUserGrowthChart(months = 12) {
  try {
    const res = await api.get(`/api/admin/overview/charts/user-growth?months=${months}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
    }
    return { success: false, error: "Không thể lấy dữ liệu tăng trưởng" };
  } catch (err) {
    console.error("User growth chart error:", err);
    return { success: false, error: "Lỗi khi lấy biểu đồ người dùng" };
  }
}

/** Lấy biểu đồ doanh thu */
export async function getRevenueChart(months = 6) {
  try {
    const res = await api.get(`/api/admin/overview/charts/revenue?months=${months}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
    }
    return { success: false, error: "Không thể lấy dữ liệu doanh thu" };
  } catch (err) {
    console.error("Revenue chart error:", err);
    return { success: false, error: "Lỗi khi lấy biểu đồ doanh thu" };
  }
}

/** Lấy biểu đồ enrollment */
export async function getEnrollmentChart(months = 6) {
  try {
    const res = await api.get(`/api/admin/overview/charts/enrollments?months=${months}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
    }
    return { success: false, error: "Không thể lấy dữ liệu enrollment" };
  } catch (err) {
    console.error("Enrollment chart error:", err);
    return { success: false, error: "Lỗi khi lấy biểu đồ enrollment" };
  }
}

/** Lấy top khóa học theo enrollment */
export async function getTopCourses(limit = 10) {
  try {
    const res = await api.get(`/api/admin/overview/top-courses?limit=${limit}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
    }
    return { success: false, error: "Không thể lấy top khóa học" };
  } catch (err) {
    console.error("Top courses error:", err);
    return { success: false, error: "Lỗi khi lấy top khóa học" };
  }
}

/** Lấy top instructors */
export async function getTopInstructors(limit = 10) {
  try {
    const res = await api.get(`/api/admin/overview/top-instructors?limit=${limit}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
    }
    return { success: false, error: "Không thể lấy top instructors" };
  } catch (err) {
    console.error("Top instructors error:", err);
    return { success: false, error: "Lỗi khi lấy top instructors" };
  }
}

/** Lấy top khóa học theo doanh thu */
export async function getTopRevenueCourses(limit = 10) {
  try {
    const res = await api.get(`/api/admin/overview/top-revenue-courses?limit=${limit}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
    }
    return { success: false, error: "Không thể lấy top revenue courses" };
  } catch (err) {
    console.error("Top revenue courses error:", err);
    return { success: false, error: "Lỗi khi lấy top revenue courses" };
  }
}

/** Lấy quiz performance */
export async function getQuizPerformance() {
  try {
    const res = await api.get("/api/admin/overview/quiz-performance");
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
    }
    return { success: false, error: "Không thể lấy quiz performance" };
  } catch (err) {
    console.error("Quiz performance error:", err);
    return { success: false, error: "Lỗi khi lấy quiz performance" };
  }
}

/** Export dashboard data */
export async function exportDashboardData(type = "summary") {
  try {
    const res = await api.get(`/api/admin/overview/export?type=${type}`, {
      responseType: "blob",
    });
    if (res.status === 200) {
      return res.data;
    }
    throw new Error("Không thể export dữ liệu");
  } catch (err) {
    console.error("Export error:", err);
    throw new Error(err.response?.data?.message || "Lỗi khi export dữ liệu");
  }
}

/**
 * ==================== ADMIN STATS ====================
 */

/** Lấy thống kê doanh thu theo khoảng thời gian */
export async function getRevenueStats({ startDate, endDate, groupBy = "day" }) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("groupBy", groupBy);

    const res = await api.get(`/api/admin/revenue?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
    }
    return { success: false, error: "Không thể lấy thống kê doanh thu" };
  } catch (err) {
    console.error("Revenue stats error:", err);
    return { success: false, error: "Lỗi khi lấy dữ liệu doanh thu" };
  }
}

/** Lấy thống kê người dùng mới */
export async function getUserGrowthStats({
  startDate,
  endDate,
  groupBy = "day",
}) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("groupBy", groupBy);

    const res = await api.get(`/api/admin/users/growth?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
    }
    return { success: false, error: "Không thể lấy thống kê người dùng" };
  } catch (err) {
    console.error("User growth error:", err);
    return { success: false, error: "Lỗi khi lấy dữ liệu người dùng" };
  }
}
