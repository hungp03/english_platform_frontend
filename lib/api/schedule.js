import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

export async function getMySchedule(page = 1, size = 5, sort = "createdAt,asc") {
  try {
    const res = await api.get(`/api/study-plans`, {
      params: {
        page,
        size,
        sort
      }
    });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Lấy danh sách thất bại" };
  } catch (err) {
    return { success: false, error: "Lấy danh sách thất bại" };
  }
}

export async function createStudyPlan(data) {
  try {
    const res = await api.post(`/api/study-plans`, data);
    if (res.status === 201) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Tạo nhắc nhở học tập thất bại" };
  } catch (err) {
    return {
      success: false,
      error: "Tạo nhắc nhở học tập thất bại"
    };
  }
}

export async function updateStudyPlan(id, data) {
  try {
    const res = await api.put(`/api/study-plans/${id}`, data);
    if (res.status === 200 || res.status === 201) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Cập nhật nhắc nhở học tập thất bại" };
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy nhắc nhở học tập" };
    }
    return {
      success: false,
      error: "Cập nhật nhắc nhở học tập thất bại"
    };
  }
}

export async function markScheduleComplete(planId, scheduleId) {
  try {
    const res = await api.patch(`/api/study-plans/${planId}/schedules/${scheduleId}/mark-complete`);
    if (res.status === 204) {
      return { success: true };
    }
    return { success: false, error: "Đánh dấu hoàn thành thất bại" };
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy lịch học" };
    }
    return {
      success: false,
      error: "Đánh dấu hoàn thành thất bại"
    };
  }
}

export async function deleteStudyPlan(id) {
  try {
    const res = await api.delete(`/api/study-plans/${id}`);
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Xóa nhắc nhở học tập thất bại" };
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy nhắc nhở học tập" };
    }
    return {
      success: false,
      error: "Xóa nhắc nhở học tập thất bại"
    };
  }
}

export async function generateAIPlan(data) {
  try {
    const res = await api.post(`/api/study-plans/generate-ai-plan`, data);
    if (res.status === 200 || res.status === 201) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Tạo nhắc nhở học tập thất bại" };
  } catch (err) {
    return {
      success: false,
      error: "Tạo nhắc nhở học tập thất bại"
    };
  }
}
