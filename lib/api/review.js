// lib/api/review.js
import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

// --- PUBLIC ---

export async function getPublicCourseReviews(courseId, { page = 0, size = 10 } = {}) {
  try {
    const res = await api.get(`/api/courses/${courseId}/reviews`, {
      params: { page, size }
    });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách đánh giá" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách đánh giá";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy khóa học.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function getCourseReviewStats(courseId) {
  try {
    const res = await api.get(`/api/courses/${courseId}/reviews/stats`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy thống kê đánh giá" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy thống kê đánh giá";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy khóa học.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

// --- USER (AUTHENTICATED) ---

export async function getMyReview(courseId) {
  try {
    const res = await api.get(`/api/courses/${courseId}/reviews/me`);
    // 204 No Content means no review yet
    if (res.status === 204) {
      return { success: true, data: null };
    }
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Lỗi khi kiểm tra đánh giá" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Lỗi khi kiểm tra đánh giá";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem đánh giá của mình.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function createReview(courseId, payload) {
  try {
    const res = await api.post(`/api/courses/${courseId}/reviews`, payload);
    if (res.status === 201 || res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Đánh giá thất bại" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Đánh giá thất bại";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để đánh giá khóa học.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = message || "Không tìm thấy khóa học hoặc người dùng.";
        break;
      case ErrorCode.RESOURCE_ALREADY_EXISTS:
        errorMessage = "Bạn đã đánh giá khóa học này rồi.";
        break;
      case ErrorCode.OPERATION_NOT_ALLOWED:
        errorMessage = "Bạn cần đăng ký khóa học để viết đánh giá.";
        break;
      case ErrorCode.METHOD_NOT_VALID:
        errorMessage = message || "Dữ liệu đánh giá không hợp lệ (rating phải từ 1-5).";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateReview(reviewId, payload) {
  try {
    const res = await api.put(`/api/courses/reviews/${reviewId}`, payload);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Cập nhật thất bại" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Cập nhật thất bại";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để cập nhật đánh giá.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy đánh giá.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn chỉ có thể cập nhật đánh giá của chính mình.";
        break;
      case ErrorCode.METHOD_NOT_VALID:
        errorMessage = message || "Dữ liệu đánh giá không hợp lệ (rating phải từ 1-5).";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteReview(reviewId) {
  try {
    const res = await api.delete(`/api/courses/reviews/${reviewId}`);
    if (res.status === 200 || res.status === 204) {
      return { success: true };
    }
    return { success: false, error: "Xóa thất bại" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Xóa thất bại";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xóa đánh giá.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy đánh giá.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn chỉ có thể xóa đánh giá của chính mình.";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function hideReview(reviewId) {
  try {
    const res = await api.post(`/api/courses/reviews/${reviewId}/hide`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể ẩn đánh giá" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể ẩn đánh giá";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập với vai trò giảng viên.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn chỉ có thể ẩn đánh giá của khóa học thuộc về mình.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy đánh giá.";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function showReview(reviewId) {
  try {
    const res = await api.post(`/api/courses/reviews/${reviewId}/show`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể hiện đánh giá" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể hiện đánh giá";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập với vai trò giảng viên.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn chỉ có thể hiện đánh giá của khóa học thuộc về mình.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy đánh giá.";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function getInstructorCourseReviews(courseId, { page = 0, size = 10, isPublished, rating } = {}) {
  try {
    const params = { page, size };
    if (isPublished !== undefined && isPublished !== "ALL") {
      params.isPublished = isPublished;
    }
    if (rating && rating !== "ALL") {
      params.rating = rating;
    }

    const res = await api.get(`/api/courses/${courseId}/reviews/instructor`, { params });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách đánh giá" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách đánh giá";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập với vai trò giảng viên.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xem đánh giá của khóa học này.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy khóa học.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function getMyReviewsList({ page = 1, size = 10 } = {}) {
  try {
    const res = await api.get(`/api/courses/reviews/me`, {
      params: { 
        page: page - 1, 
        size 
      }
    });
    
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể tải lịch sử đánh giá" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể tải lịch sử đánh giá";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem lịch sử đánh giá.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}