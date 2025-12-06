import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";
export async function getMyEnrollments(params = {}) {
  try {
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10,
      sort: params.sort || "createdAt,desc"
    };

    const res = await api.get("/api/enrollments/me", {
      params: queryParams
    });

    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách khóa học của bạn" };
  } catch (err) {
    console.error("Get orders error:", err);
    return { success: false, error: "Không thể lấy danh sách khóa học của bạn" };
  }
}

export async function getEnrollmentsBySlug(slug) {
  try {
    const res = await api.get(`/api/enrollments/courses/${slug}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy thông tin khóa học" };
  } catch (err) {
    console.error("Get enrollment error:", err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy thông tin khóa học, vui lòng thử lại sau";
    switch (code) {
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền truy cập khóa học này";
        break;
      default:
        console.error("Get order by ID error:", err);
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export const getLessonWithEnrollmentCheck= async(lessonId) => {
    if (!lessonId) {
    return { success: false, error: "Thiếu ID bài học" };
  }
  try {
    const res = await api.get(`/api/enrollments/lessons/${lessonId}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
  }
  catch (err) {
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy thông tin bài học, vui lòng thử lại sau";
    switch (code) {
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền truy cập khóa học này";
        break;
      default:
        console.error("Get order by ID error:", err);
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export const markLessonCompleted = async (lessonId, enrollmentId) => {
  if (!lessonId) {
    return { success: false, error: "Thiếu ID bài học" };
  }
  
  try {
    const res = await api.post(`/api/lesson-progress/mark-completed`, {
      lessonId,
      enrollmentId
    });
    
    if (res.status === 204) {
      return { success: true, data: null };
    }
  } catch (err) {
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể đánh dấu bài học hoàn thành, vui lòng thử lại sau";
    
    switch (code) {
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền truy cập khóa học này";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Thông tin khóa học không hợp lệ"
        break;
      default:
        console.error("Mark lesson completed error:", err);
        break;
    }
    
    return { success: false, error: errorMessage };
  }
};