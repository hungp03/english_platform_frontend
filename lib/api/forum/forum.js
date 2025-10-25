import api from "@/lib/axios";

// ===== Utility Functions =====
export const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

export const unwrapList = (data) =>
  Array.isArray(data?.result)
    ? data.result
    : Array.isArray(data?.content)
    ? data.content
    : Array.isArray(data)
    ? data
    : [];

export const unwrapPaged = (res) => {
  const data = unwrap(res);
  const items = unwrapList(data);
  const meta = data?.meta ?? {
    page: 1,
    pageSize: items?.length ?? 0,
    pages: 1,
    total: items?.length ?? 0,
  };
  return { items, meta };
};

// ===== PUBLIC APIs =====
export async function forumListCategories() {
  const res = await api.get("/api/public/forum/categories");
  return unwrapList(unwrap(res));
}

export async function forumListThreads(params = {}) {
  const res = await api.get("/api/public/forum/threads", { params });
  return unwrapPaged(res);
}

export async function forumGetThreadBySlug(slug) {
  const res = await api.get(`/api/public/forum/threads/${slug}`);
  return unwrap(res);
}

export async function forumListThreadPosts(threadId, params = {}) {
  const res = await api.get(`/api/public/forum/threads/${threadId}/posts`, { params });
  return unwrapPaged(res);
}

// ===== APP (Auth) APIs =====
export async function appCreateThread(payload, opts = {}) {
  const res = await api.post("/api/app/forum/threads", payload);
  return unwrap(res);
}

export async function appReplyThread(threadId, payload, opts = {}) {
  const res = await api.post(`/api/app/forum/threads/${threadId}/posts`, payload);
  return unwrap(res);
}

export async function appCreateReport(payload, opts = {}) {
  const res = await api.post("/api/app/forum/reports", payload);
  return unwrap(res);
}

// ===== ADMIN: Categories =====
export async function adminForumListCategories() {
  const res = await api.get("/api/admin/forum/categories");
  return unwrapList(unwrap(res));
}

export async function adminForumCreateCategory(payload) {
  const res = await api.post("/api/admin/forum/categories", payload);
  return unwrap(res);
}

export async function adminForumUpdateCategory(id, payload) {
  const res = await api.put(`/api/admin/forum/categories/${id}`, payload);
  return unwrap(res);
}

export async function adminForumDeleteCategory(id) {
  const res = await api.delete(`/api/admin/forum/categories/${id}`);
  return res?.status === 204 ? true : unwrap(res);
}

// ===== ADMIN: Threads =====
export async function adminListThreads(params = {}) {
  const res = await api.get("/api/admin/forum/threads", { params });
  return unwrapPaged(res);
}

export async function adminLockThread(id) {
  const res = await api.patch(`/api/admin/forum/threads/${id}/lock`);
  return unwrap(res);
}

export async function adminUnlockThread(id) {
  const res = await api.patch(`/api/admin/forum/threads/${id}/unlock`);
  return unwrap(res);
}

export async function adminDeleteThread(id) {
  const res = await api.delete(`/api/admin/forum/threads/${id}`);
  return res?.status === 204 ? true : unwrap(res);
}

// ===== ADMIN: Posts =====
export async function adminHidePost(id) {
  const res = await api.post(`/api/admin/forum/posts/${id}/hide`);
  return unwrap(res);
}

export async function adminUnhidePost(id) {
  const res = await api.post(`/api/admin/forum/posts/${id}/unhide`);
  return unwrap(res);
}

export async function adminDeletePost(id) {
  const res = await api.delete(`/api/admin/forum/posts/${id}`);
  return res?.status === 204 ? true : unwrap(res);
}

// ===== ADMIN: Reports =====
export async function adminListReports(params = {}) {
  const res = await api.get("/api/admin/forum/reports", { params });
  return unwrapPaged(res);
}

export async function adminResolveReport(id, opts = {}) {
  const res = await api.post(`/api/admin/forum/reports/${id}/resolve`, null);
  return unwrap(res);
}

export async function appReportPost(postId, { reason }) {

    const res = await api.post(`/api/app/forum/posts/${postId}/report`, { reason });
    return unwrap(res);
}
  
  /** Báo cáo thread */
export async function appReportThread(threadId, { reason }) {
    const res = await api.post(`/api/app/forum/threads/${threadId}/report`, { reason });
    return unwrap(res);
}
// ===== Export Axios (Optional) =====
export default api;

/** Owner lock a thread */
export async function appLockThread(id) {
  const res = await api.patch(`/api/app/forum/threads/${id}/lock`);
  return unwrap(res);
}

/** Owner unlock a thread */
export async function appUnlockThread(id) {
  const res = await api.patch(`/api/app/forum/threads/${id}/unlock`);
  return unwrap(res);
}

/** Owner delete own post */
export async function appDeleteOwnPost(id) {
  const res = await api.delete(`/api/app/forum/posts/${id}`);
  return res?.status === 204 ? true : unwrap(res);
}
