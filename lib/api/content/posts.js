import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

const unwrapList = (data) =>
  Array.isArray(data?.result)
    ? data.result
    : Array.isArray(data?.content)
    ? data.content
    : Array.isArray(data)
    ? data
    : [];

const fallbackMeta = (items = []) => ({
  page: 1,
  pageSize: items.length,
  pages: 1,
  total: items.length,
});

export async function adminSearchPosts(params = {}) {
  try {
    const res = await api.get("/api/blog/posts/admin", { params });
    if (res.status === 200) {
      const data = res.data?.data || res.data;
      return { success: true, data: unwrapList(data) };
    }
    return { success: false, error: "Không thể tìm kiếm bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể tìm kiếm bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem danh sách bài viết.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xem danh sách bài viết.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function adminSearchPostsPaged(params = {}) {
  try {
    const res = await api.get("/api/blog/posts/admin", { params });
    if (res.status === 200) {
      const data = res.data?.data || res.data;
      const items = unwrapList(data);
      const meta = data?.meta ?? fallbackMeta(items);
      return { success: true, data: { items, meta } };
    }
    return { success: false, error: "Không thể tìm kiếm bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể tìm kiếm bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem danh sách bài viết.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xem danh sách bài viết.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function adminCreatePost(payload) {
  try {
    const body = { ...payload };
    if (!body.slug || body.slug.trim() === "") delete body.slug;
    const res = await api.post("/api/blog/posts/admin", body);
    if (res.status === 200 || res.status === 201) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể tạo bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể tạo bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để tạo bài viết.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền tạo bài viết.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = message || "Một số danh mục không tồn tại.";
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

export async function adminUpdatePost(id, payload) {
  try {
    const res = await api.patch(`/api/blog/posts/admin/${id}`, payload);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể cập nhật bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể cập nhật bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để cập nhật bài viết.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền cập nhật bài viết.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = message || "Không tìm thấy bài viết.";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function adminDeletePost(id) {
  try {
    const res = await api.delete(`/api/blog/posts/admin/${id}`);
    if (res.status === 204 || res.status === 200) {
      return { success: true, data: null };
    }
    return { success: false, error: "Không thể xóa bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể xóa bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xóa bài viết.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xóa bài viết.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài viết.";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function adminPublishPost(id) {
  try {
    const res = await api.post(`/api/blog/posts/admin/${id}/publish`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể xuất bản bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể xuất bản bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xuất bản bài viết.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xuất bản bài viết.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài viết.";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function adminUnpublishPost(id) {
  try {
    const res = await api.post(`/api/blog/posts/admin/${id}/unpublish`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể gỡ xuất bản bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể gỡ xuất bản bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để gỡ xuất bản bài viết.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền gỡ xuất bản bài viết.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài viết.";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function adminGetPost(id) {
  try {
    const res = await api.get(`/api/blog/posts/admin/${id}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy thông tin bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy thông tin bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem bài viết.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xem bài viết.";
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

export async function publicListPosts(params = {}) {
  try {
    const res = await api.get("/api/blog/posts", { params });
    if (res.status === 200) {
      const data = res.data?.data || res.data;
      return { success: true, data: unwrapList(data) };
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
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function publicListPostsPaged(params = {}) {
  try {
    const res = await api.get("/api/blog/posts", { params });
    if (res.status === 200) {
      const data = res.data?.data || res.data;
      const items = unwrapList(data);
      const meta = data?.meta ?? fallbackMeta(items);
      return { success: true, data: { items, meta } };
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
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

export async function publicGetPostBySlug(slug) {
  try {
    const res = await api.get(`/api/blog/posts/slug/${slug}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy thông tin bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy thông tin bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
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

export async function appCreatePost(payload) {
  try {
    const res = await api.post("/api/blog/posts", payload);
    if (res.status === 200 || res.status === 201) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể tạo bài viết" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể tạo bài viết";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để tạo bài viết.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = message || "Một số danh mục không tồn tại.";
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
