import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

// ===== PUBLIC APIs =====

/**
 * Lấy danh sách tất cả chuyên mục diễn đàn
 */
export async function getForumCategories() {
  try {
    const res = await api.get("/api/forum/categories");
    if (res.status === 200) {
      return { success: true, data: res.data?.data || [] };
    }
    return { success: false, error: "Không thể lấy danh sách chuyên mục" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách chuyên mục";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy danh sách chủ đề diễn đàn (có phân trang và filter)
 */
export async function getForumThreads(params = {}) {
  try {
    const res = await api.get("/api/forum/threads", { params });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy thông tin chi tiết chủ đề theo slug
 */
export async function getForumThreadBySlug(slug) {
  try {
    const res = await api.get(`/api/forum/threads/${slug}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy thông tin chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy thông tin chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chủ đề.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy danh sách bài viết/trả lời trong một chủ đề
 */
export async function getThreadPosts(threadId, params = {}) {
  try {
    const res = await api.get(`/api/forum/threads/${threadId}/posts`, { params });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chủ đề.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

// ===== AUTHENTICATED USER APIs =====

/**
 * Tạo chủ đề mới trong diễn đàn
 */
export async function createThread(payload) {
  try {
    const res = await api.post("/api/forum/threads", payload);
    if (res.status === 201 || res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể tạo chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể tạo chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để tạo chủ đề.";
        break;
      case ErrorCode.METHOD_NOT_VALID:
        errorMessage = "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Cập nhật chủ đề của mình
 */
export async function updateThread(id, payload) {
  try {
    const res = await api.put(`/api/forum/threads/${id}`, payload);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể cập nhật chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể cập nhật chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để cập nhật chủ đề.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chủ đề.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền sửa chủ đề này.";
        break;
      case ErrorCode.RESOURCE_INVALID:
        errorMessage = "Chủ đề đang bị khóa, không thể chỉnh sửa.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Xóa chủ đề của mình
 */
export async function deleteOwnThread(id) {
  try {
    const res = await api.delete(`/api/forum/threads/${id}`);
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Không thể xóa chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể xóa chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xóa chủ đề.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chủ đề.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xóa chủ đề này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Trả lời chủ đề (tạo bài viết mới)
 */
export async function replyToThread(threadId, payload) {
  try {
    const res = await api.post(`/api/forum/threads/${threadId}/posts`, payload);
    if (res.status === 201 || res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể trả lời chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể trả lời chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để trả lời.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chủ đề.";
        break;
      case ErrorCode.RESOURCE_INVALID:
        errorMessage = "Chủ đề đang bị khóa, không thể trả lời.";
        break;
      case ErrorCode.METHOD_NOT_VALID:
        errorMessage = "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Trả lời một bài viết (nested reply)
 */
export async function replyToPost(threadId, parentPostId, payload) {
  try {
    const res = await api.post(`/api/forum/threads/${threadId}/posts`, {
      ...payload,
      parentId: parentPostId,
    });
    if (res.status === 201 || res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể trả lời bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể trả lời bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để trả lời.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chủ đề hoặc bài viết.";
        break;
      case ErrorCode.RESOURCE_INVALID:
        errorMessage = "Chủ đề đang bị khóa, không thể trả lời.";
        break;
      case ErrorCode.METHOD_NOT_VALID:
        errorMessage = "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Xóa bài viết của mình
 */
export async function deleteOwnPost(id) {
  try {
    const res = await api.delete(`/api/forum/posts/${id}`);
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Không thể xóa bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể xóa bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xóa bài viết.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài viết.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xóa bài viết này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Khóa chủ đề của mình
 */
export async function lockThread(id) {
  try {
    const res = await api.post(`/api/forum/threads/${id}/lock`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể khóa chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể khóa chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để khóa chủ đề.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chủ đề.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền khóa chủ đề này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Mở khóa chủ đề của mình
 */
export async function unlockThread(id) {
  try {
    const res = await api.post(`/api/forum/threads/${id}/unlock`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể mở khóa chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể mở khóa chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để mở khóa chủ đề.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chủ đề.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền mở khóa chủ đề này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy danh sách chủ đề của người dùng hiện tại
 */
export async function getMyThreads(params = {}) {
  try {
    const res = await api.get("/api/forum/threads/me", { params });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách chủ đề của bạn" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách chủ đề của bạn";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem danh sách chủ đề.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Báo cáo một bài viết
 */
export async function reportPost(postId, reason) {
  try {
    const res = await api.post(`/api/forum/posts/${postId}/reports`, { reason });
    if (res.status === 201 || res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể báo cáo bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể báo cáo bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để báo cáo bài viết.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Báo cáo một chủ đề
 */
export async function reportThread(threadId, reason) {
  try {
    const res = await api.post(`/api/forum/threads/${threadId}/reports`, { reason });
    if (res.status === 201 || res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể báo cáo chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể báo cáo chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để báo cáo chủ đề.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Tạo báo cáo chung
 */
export async function createReport(payload) {
  try {
    const res = await api.post("/api/forum/reports", payload);
    if (res.status === 201 || res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể tạo báo cáo" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể tạo báo cáo";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để tạo báo cáo.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

// ===== ADMIN APIs =====

/**
 * Admin: Lấy danh sách tất cả chuyên mục
 */
export async function adminGetCategories() {
  try {
    const res = await api.get("/api/forum/categories");
    if (res.status === 200) {
      return { success: true, data: res.data?.data || [] };
    }
    return { success: false, error: "Không thể lấy danh sách chuyên mục" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách chuyên mục";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền truy cập trang này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Tạo chuyên mục mới
 */
export async function adminCreateCategory(payload) {
  try {
    const res = await api.post("/api/forum/categories", payload);
    if (res.status === 201 || res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể tạo chuyên mục" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể tạo chuyên mục";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền tạo chuyên mục.";
        break;
      case ErrorCode.METHOD_NOT_VALID:
        errorMessage = "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Cập nhật chuyên mục
 */
export async function adminUpdateCategory(id, payload) {
  try {
    const res = await api.put(`/api/forum/categories/${id}`, payload);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể cập nhật chuyên mục" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể cập nhật chuyên mục";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền cập nhật chuyên mục.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chuyên mục.";
        break;
      case ErrorCode.METHOD_NOT_VALID:
        errorMessage = "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Xóa chuyên mục
 */
export async function adminDeleteCategory(id) {
  try {
    const res = await api.delete(`/api/forum/categories/${id}`);
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Không thể xóa chuyên mục" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể xóa chuyên mục";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xóa chuyên mục.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Lấy danh sách tất cả chủ đề
 */
export async function adminGetThreads(params = {}) {
  try {
    const res = await api.get("/api/forum/threads/admin", { params });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền truy cập trang này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Khóa chủ đề
 */
export async function adminLockThread(id) {
  try {
    const res = await api.post(`/api/forum/threads/${id}/lock/admin`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể khóa chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể khóa chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền khóa chủ đề.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chủ đề.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Mở khóa chủ đề
 */
export async function adminUnlockThread(id) {
  try {
    const res = await api.post(`/api/forum/threads/${id}/unlock/admin`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể mở khóa chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể mở khóa chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền mở khóa chủ đề.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chủ đề.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Xóa chủ đề
 */
export async function adminDeleteThread(id) {
  try {
    const res = await api.delete(`/api/forum/threads/${id}/admin`);
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Không thể xóa chủ đề" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể xóa chủ đề";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xóa chủ đề.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy chủ đề.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Ẩn bài viết
 */
export async function adminHidePost(id) {
  try {
    const res = await api.post(`/api/forum/posts/${id}/hide/admin`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể ẩn bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể ẩn bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền ẩn bài viết.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài viết.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Hiện bài viết
 */
export async function adminUnhidePost(id) {
  try {
    const res = await api.post(`/api/forum/posts/${id}/unhide/admin`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể hiện bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể hiện bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền hiện bài viết.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài viết.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Xóa bài viết
 */
export async function adminDeletePost(id) {
  try {
    const res = await api.delete(`/api/forum/posts/${id}/admin`);
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Không thể xóa bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể xóa bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xóa bài viết.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài viết.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Lấy danh sách tất cả báo cáo
 */
export async function adminGetReports(params = {}) {
  try {
    const res = await api.get("/api/forum/reports", { params });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách báo cáo" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách báo cáo";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền truy cập trang này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Admin: Giải quyết báo cáo
 */
export async function adminResolveReport(id) {
  try {
    const res = await api.post(`/api/forum/reports/${id}/resolve`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể giải quyết báo cáo" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể giải quyết báo cáo";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền giải quyết báo cáo.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy báo cáo.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export default api;
