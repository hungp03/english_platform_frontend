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

export async function adminListCommentsByPost(postId, params = {}) {
  try {
    const res = await api.get(`/api/blog/comments/post/${postId}`, { params });
    if (res.status === 200) {
      const data = res.data?.data || res.data;
      return { success: true, data: unwrapList(data) };
    }
    return { success: false, error: "Không thể lấy danh sách bình luận" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy danh sách bình luận" };
  }
}

export async function adminListCommentsByPostPaged(postId, params = {}) {
  try {
    const res = await api.get(`/api/blog/comments/post/${postId}`, { params });
    if (res.status === 200) {
      const data = res.data?.data || res.data;
      const items = unwrapList(data);
      const meta = data?.meta ?? fallbackMeta(items);
      return { success: true, data: { items, meta } };
    }
    return { success: false, error: "Không thể lấy danh sách bình luận" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy danh sách bình luận" };
  }
}

export async function adminHideComment(id) {
  try {
    const res = await api.post(`/api/admin/content/comments/${id}/hide`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể ẩn bình luận" };
  } catch (err) {
    console.error(err);
    const message = err?.response?.data?.message || "Không thể ẩn bình luận";
    return { success: false, error: message };
  }
}

export async function adminUnhideComment(id) {
  try {
    const res = await api.post(`/api/admin/content/comments/${id}/unhide`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể hiện bình luận" };
  } catch (err) {
    console.error(err);
    const message = err?.response?.data?.message || "Không thể hiện bình luận";
    return { success: false, error: message };
  }
}

export async function adminDeleteComment(id) {
  try {
    const res = await api.delete(`/api/admin/content/comments/${id}`);
    if (res.status === 204 || res.status === 200) {
      return { success: true, data: null };
    }
    return { success: false, error: "Không thể xóa bình luận" };
  } catch (err) {
    console.error(err);
    const message = err?.response?.data?.message || "Không thể xóa bình luận";
    return { success: false, error: message };
  }
}

export async function adminListAllCommentsPaged(params = {}) {
  try {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const query = { page, pageSize };
    if (params.keyword?.trim()) query.keyword = params.keyword.trim();
    if (typeof params.published === "boolean") query.published = params.published;
    if (params.postId) query.postId = params.postId;
    if (params.authorId) query.authorId = params.authorId;

    const res = await api.get("/api/admin/content/comments", { params: query });
    if (res.status === 200) {
      const data = res.data?.data || res.data;
      const items = unwrapList(data);
      const meta = data?.meta ?? fallbackMeta(items);
      return { success: true, data: { items, meta } };
    }
    return { success: false, error: "Không thể lấy danh sách bình luận" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy danh sách bình luận" };
  }
}

export async function publicListCommentsByPostPaged(postId, params = {}) {
  try {
    const res = await api.get(`/api/blog/comments/post/${postId}`, { params });
    if (res.status === 200) {
      const data = res.data?.data || res.data;
      const items = unwrapList(data);
      const meta = data?.meta ?? fallbackMeta(items);
      return { success: true, data: { items, meta } };
    }
    return { success: false, error: "Không thể lấy danh sách bình luận" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách bình luận";

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

export async function appCreateComment(postId, payload) {
  try {
    const res = await api.post(`/api/blog/comments/post/${postId}`, payload);
    if (res.status === 200 || res.status === 201) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể tạo bình luận" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể tạo bình luận";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để bình luận.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = message || "Không tìm thấy bài viết hoặc bình luận cha.";
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

export async function appDeleteComment(commentId) {
  try {
    const res = await api.delete(`/api/blog/comments/${commentId}`);
    if (res.status === 204 || res.status === 200) {
      return { success: true, data: null };
    }
    return { success: false, error: "Không thể xóa bình luận" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;
    let errorMessage = "Không thể xóa bình luận";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xóa bình luận.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bình luận.";
        break;
      default:
        if (message) errorMessage = message;
        break;
    }
    return { success: false, error: errorMessage };
  }
}
