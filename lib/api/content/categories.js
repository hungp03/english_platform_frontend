import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

export async function listCategories(params = {}) {
  try {
    const res = await api.get("/api/blog/categories", { params });
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy danh sách danh mục" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách danh mục";

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

export async function listPublicCategories(params = {}) {
  try {
    const res = await api.get("/api/blog/categories", { params });
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy danh sách danh mục" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách danh mục";

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

export async function createCategory(payload) {
  try {
    const body = { ...payload };
    if (!body.slug || body.slug.trim() === "") delete body.slug;
    if (!body.id && typeof crypto !== "undefined" && crypto.randomUUID)
      body.id = crypto.randomUUID();
    const res = await api.post("/api/blog/categories", body);
    if (res.status === 200 || res.status === 201) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể tạo danh mục" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể tạo danh mục";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để tạo danh mục.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền tạo danh mục.";
        break;
      case ErrorCode.RESOURCE_INVALID:
        errorMessage = message || "Slug không hợp lệ theo chuẩn SEO.";
        break;
      case ErrorCode.RESOURCE_ALREADY_EXISTS:
        errorMessage = message || "Slug đã tồn tại.";
        break;
      case ErrorCode.METHOD_NOT_VALID:
        errorMessage = message || "Dữ liệu đầu vào không hợp lệ.";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateCategory(id, payload) {
  try {
    const res = await api.patch(`/api/blog/categories/${id}`, payload);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể cập nhật danh mục" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể cập nhật danh mục";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để cập nhật danh mục.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền cập nhật danh mục.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy danh mục.";
        break;
      case ErrorCode.RESOURCE_INVALID:
        errorMessage = message || "Slug không hợp lệ theo chuẩn SEO.";
        break;
      case ErrorCode.RESOURCE_ALREADY_EXISTS:
        errorMessage = message || "Slug đã tồn tại.";
        break;
      case ErrorCode.METHOD_NOT_VALID:
        errorMessage = message || "Dữ liệu đầu vào không hợp lệ.";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteCategory(id) {
  try {
    const res = await api.delete(`/api/blog/categories/${id}`);
    if (res.status === 204 || res.status === 200) {
      return { success: true, data: null };
    }
    return { success: false, error: "Không thể xóa danh mục" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể xóa danh mục";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xóa danh mục.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xóa danh mục.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy danh mục.";
        break;
      case ErrorCode.CANNOT_DELETE:
        errorMessage = message || "Không thể xóa danh mục có bài viết liên kết.";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function getCategory(id) {
  try {
    const res = await api.get(`/api/blog/categories/${id}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy thông tin danh mục" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy thông tin danh mục";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem thông tin danh mục.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xem thông tin danh mục.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy danh mục.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}
