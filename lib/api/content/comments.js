import api from "@/lib/axios";

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;
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

// ------- Admin -------
export async function adminListCommentsByPost(postId, params = {}) {
  const res = await api.get(`/api/admin/content/comments/by-post/${postId}`, {
    params,
  });
  const data = unwrap(res);
  return unwrapList(data);
}
export async function adminListCommentsByPostPaged(postId, params = {}) {
  const res = await api.get(`/api/admin/content/comments/by-post/${postId}`, {
    params,
  });
  const data = unwrap(res);
  const items = unwrapList(data);
  const meta = data?.meta ?? fallbackMeta(items);
  return { items, meta };
}
export async function adminHideComment(id) {
  return unwrap(await api.post(`/api/admin/content/comments/${id}/hide`));
}
export async function adminUnhideComment(id) {
  return unwrap(await api.post(`/api/admin/content/comments/${id}/unhide`));
}
export async function adminDeleteComment(id) {
  const res = await api.delete(`/api/admin/content/comments/${id}`);
  return res?.status === 204 ? true : unwrap(res);
}

/** Lấy tất cả bình luận (phân trang) từ controller mới */
export async function adminListAllCommentsPaged(params = {}) {
  const page = Number(params.page) || 1; // backend 1-based
  const pageSize = Number(params.pageSize) || 20;

  const query = { page, pageSize };
  if (params.keyword?.trim()) query.keyword = params.keyword.trim();
  if (typeof params.published === "boolean") query.published = params.published;
  if (params.postId) query.postId = params.postId; // optional nếu sau muốn lọc theo bài
  if (params.authorId) query.authorId = params.authorId; // optional

  const res = await api.get("/api/admin/content/comments", { params: query });
  const data = unwrap(res);
  const items = unwrapList(data);
  const meta = data?.meta ?? fallbackMeta(items, page, pageSize);
  return { items, meta };
}
// ------- Public -------
export async function publicListCommentsByPost(postId, params = {}) {
  const res = await api.get(`/api/public/content/posts/${postId}/comments`, {
    params,
  });
  const data = unwrap(res);
  return unwrapList(data);
}

// ------- App (authenticated) -------
export async function appCreateComment(postId, payload) {
  const res = await api.post(
    `/api/app/content/posts/${postId}/comments`,
    payload
  );
  return unwrap(res);
}
