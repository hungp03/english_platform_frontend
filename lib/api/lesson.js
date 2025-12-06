import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

export const listCourseLessons = async (moduleId) => {
  if (!moduleId) {
    return { success: false, error: "Thiếu ID chương" };
  }
  try {
    const res = await api.get(`/api/modules/${moduleId}/lessons`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
  }
  catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy danh sách bài học" };
  }
}

export const listPublishedCourseLessons = async (moduleId) => {
  if (!moduleId) {
    return { success: false, error: "Thiếu ID chương" };
  }
  try {
    const res = await api.get(`/api/modules/${moduleId}/lessons/published`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
  }
  catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy danh sách bài học" };
  }
}

export const createLesson = async (moduleId, payload) => {
  if (!moduleId) {
    return { success: false, error: "Thiếu ID module" }
  }

  try {
    const res = await api.post(`/api/modules/${moduleId}/lessons`, payload)
    if (res.status === 201) {
      return { success: true, data: res.data?.data }
    } else {
      return {
        success: false,
        error: res.data?.message || "Không thể tạo bài học",
      }
    }
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.DUPLICATE_KEY) {
      return { success: false, error: "Vị trí bị trùng" };
    }
    return {
      success: false,
      error: "Lỗi khi gọi API tạo bài học, vui lòng thử lại sau",
    }
  }
}

export const getLessonDetail = async (moduleId, lessonId) => {
  if (!moduleId) {
    return { success: false, error: "Thiếu ID module" }
  }
  if (!lessonId) {
    return { success: false, error: "Thiếu ID lesson" }
  }
  try {
    const res = await api.get(`/api/modules/${moduleId}/lessons/${lessonId}`)
    if (res.status === 200) {
      return { success: true, data: res.data?.data }
    } else {
      return {
        success: false,
        error: res.data?.message || "Không thể lấy chi tiết bài học",
      }
    }
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy bài học" };
    }
    return {
      success: false,
      error: "Lỗi khi gọi API lấy chi tiết bài học",
    }
  }
}

export const getFreeLessonDetail = async (moduleId, lessonId) => {
  if (!moduleId) {
    return { success: false, error: "Thiếu ID module" }
  }
  if (!lessonId) {
    return { success: false, error: "Thiếu ID lesson" }
  }
  try {
    const res = await api.get(`/api/modules/${moduleId}/lessons/${lessonId}/free`)
    if (res.status === 200) {
      return { success: true, data: res.data?.data }
    } else {
      return {
        success: false,
        error: res.data?.message || "Không thể lấy chi tiết bài học",
      }
    }
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy bài học" };
    }
    return {
      success: false,
      error: "Lỗi khi gọi API lấy chi tiết bài học",
    }
  }
}

export const getReviewLessonDetail = async (moduleId, lessonId) => {
  if (!moduleId) {
    return { success: false, error: "Thiếu ID module" }
  }
  if (!lessonId) {
    return { success: false, error: "Thiếu ID lesson" }
  }
  try {
    const res = await api.get(`/api/modules/${moduleId}/lessons/${lessonId}/review`)
    if (res.status === 200) {
      return { success: true, data: res.data?.data }
    } else {
      return {
        success: false,
        error: res.data?.message || "Không thể lấy chi tiết bài học",
      }
    }
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy bài học" };
    }
    return {
      success: false,
      error: "Lỗi khi gọi API lấy chi tiết bài học",
    }
  }
}

export const updateLesson = async (moduleId, lessonId, payload) => {
  if (!moduleId) {
    return { success: false, error: "Thiếu ID module" }
  }
  if (!lessonId) {
    return { success: false, error: "Thiếu ID lesson" }
  }

  try {
    const res = await api.put(`/api/modules/${moduleId}/lessons/${lessonId}`, payload)
    if (res.status === 200) {
      return { success: true, data: res.data?.data }
    } else {
      return {
        success: false,
        error: res.data?.message || "Không thể cập nhật bài học",
      }
    }
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.DUPLICATE_KEY) {
      return { success: false, error: "Vị trí bị trùng" };
    }
    if (code === ErrorCode.FORBIDDEN) {
      return { success: false, error: "Bạn không có quyền chỉnh sửa bài này" };
    }
    return {
      success: false,
      error: "Lỗi khi gọi API cập nhật bài học",
    }
  }
}

export const deleteLesson = async (moduleId, lessonId) => {
  if (!moduleId) {
    return { success: false, error: "Thiếu ID module" }
  }
  if (!lessonId) {
    return { success: false, error: "Thiếu ID lesson" }
  }

  try {
    const res = await api.delete(`/api/modules/${moduleId}/lessons/${lessonId}`)
    if (res.status === 204) {
      return { success: true }
    } else {
      return {
        success: false,
        error: res.data?.message || "Không thể xóa bài học",
      }
    }
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy bài học liên quan" };
    }
    if (code === ErrorCode.FORBIDDEN) {
      return { success: false, error: "Bạn không có quyền xóa bài này" };
    }
    return {
      success: false,
      error: "Lỗi khi gọi API xóa bài học",
    }
  }
}

export const publishLesson = async (moduleId, lessonId, publish) => {
  if (!moduleId) {
    return { success: false, error: "Thiếu ID module" }
  }
  if (!lessonId) {
    return { success: false, error: "Thiếu ID lesson" }
  }

  try {
    const res = await api.patch(`/api/modules/${moduleId}/lessons/${lessonId}/publish?publish=${publish}`)
    if (res.status === 200) {
      return { success: true, data: res.data?.data }
    } else {
      return {
        success: false,
        error: res.data?.message || "Không thể cập nhật trạng thái xuất bản",
      }
    }
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy bài học liên quan" };
    }
    if (code === ErrorCode.FORBIDDEN) {
      return { success: false, error: "Bạn không có quyền chỉnh sửa bài này" };
    }
    return {
      success: false,
      error: "Lỗi khi cập nhật trạng thái xuất bản",
    }
  }
}