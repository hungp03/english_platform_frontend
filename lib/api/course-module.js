import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

export async function getPublishedModules(courseId) {
  if (!courseId) {
    return { success: false, error: "Thiếu ID khóa học" };
  }
  try {
    const res = await api.get(`/api/courses/${courseId}/modules/published`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách chương" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy danh sách chương" };
    }
    return { success: false, error: "Không thể lấy danh sách chương" };
  }
}

export async function getCourseModules(courseId) {
  if (!courseId) {
    return { success: false, error: "Thiếu ID khóa học" };
  }
  try {
    const res = await api.get(`/api/courses/${courseId}/modules`);
    if (res.status === 200) {
      return res.data?.data;
    }
    return { success: false, error: "Không thể lấy danh sách chương" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy danh sách chương" };
    }
    return { success: false, error: "Không thể lấy danh sách chương" };
  }
}

export const getCourseModuleDetail = async (courseId, moduleId) => {
  if (!courseId || !moduleId) {
    return { success: false, error: "Thiếu courseId hoặc moduleId" };
  }

  try {
    const res = await api.get(`/api/courses/${courseId}/modules/${moduleId}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy chương này" };
    }
    return { success: false, error: "Không thể lấy thông tin chương" };
  }
};

export const createCourseModule = async (courseId, payload) => {
  if (!courseId) {
    return { success: false, error: "Thiếu ID khóa học" };
  }
  try {
    const res = await api.post(`/api/courses/${courseId}/modules`, payload);
    if (res.status === 201) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể tạo chương" };
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy khóa học liên quan" };
    }
    if (code === ErrorCode.DUPLICATE_KEY) {
      return { success: false, error: "Vị trí đã tồn tại" };
    }
    return { success: false, error: "Không thể tạo chương" };
  }
};

export const updateCourseModule = async (courseId, payload) => {
  if (!courseId) {
    return { success: false, error: "Thiếu ID khóa học" };
  }
  try {
    const res = await api.put(`/api/courses/${courseId}/modules`, payload);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể cập nhật chương" };
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy khóa học liên quan" };
    }
    if (code === ErrorCode.DUPLICATE_KEY) {
      return { success: false, error: "Vị trí bị trùng" };
    }
    if (code === ErrorCode.FORBIDDEN) {
      return { success: false, error: "Bạn không có quyền chỉnh sửa chương này" };
    }
    return { success: false, error: "Không thể cập nhật chương" };
  }
};

export const deleteCourseModule = async (courseId, moduleId) => {
  if (!courseId) {
    return { success: false, error: "Thiếu ID khóa học" };
  }
  if (!moduleId) {
    return { success: false, error: "Thiếu ID chương" };
  }
  try {
    const res = await api.delete(
      `/api/courses/${courseId}/modules/${moduleId}`
    );
    if (res.status === 204) {
      return { success: true };
    }
    return { success: false, error: "Không thể xóa chương" };
  } catch (err) {
    console.error(err);
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy tài nguyên liên quan" };
    }
    if (code === ErrorCode.FORBIDDEN) {
      return { success: false, error: "Bạn không có quyền xóa chương này" };
    }
    return { success: false, error: "Không thể xóa chương" };
  }
}

export const publishModule = async (courseId, moduleId, publish) => {
  if (!courseId) {
    return { success: false, error: "Thiếu ID khóa học" };
  }
  if (!moduleId) {
    return { success: false, error: "Thiếu ID module" };
  }
  try {
    const res = await api.patch(
      `/api/courses/${courseId}/modules/${moduleId}/publish?publish=${publish}`
    );
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể cập nhật trạng thái xuất bản" };
  } catch (err) {
    console.error(err);
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy chương" };
    }
    if (code === ErrorCode.FORBIDDEN) {
      return { success: false, error: "Bạn không có quyền cập nhật trạng thái chương này" };
    }
    return { success: false, error: "Không thể cập nhật trạng thái xuất bản" };
  }
}