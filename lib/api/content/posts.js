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
export async function adminSearchPosts(params = {}) {
  const res = await api.get("/api/admin/content/posts", { params });
  const data = unwrap(res);
  return unwrapList(data);
}
export async function adminSearchPostsPaged(params = {}) {
  const res = await api.get("/api/admin/content/posts", { params });
  const data = unwrap(res);
  const items = unwrapList(data);
  const meta = data?.meta ?? fallbackMeta(items);
  return { items, meta };
}

export async function adminCreatePost(payload) {
  const body = { ...payload };
  if (!body.slug || body.slug.trim() === "") delete body.slug;
  const res = await api.post("/api/admin/content/posts", body);
  return unwrap(res);
}
export async function adminUpdatePost(id, payload) {
  const res = await api.patch(`/api/admin/content/posts/${id}`, payload);
  return unwrap(res);
}
export async function adminDeletePost(id) {
  const res = await api.delete(`/api/admin/content/posts/${id}`);
  return res?.status === 204 ? true : unwrap(res);
}
export async function adminPublishPost(id) {
  const res = await api.post(`/api/admin/content/posts/${id}/publish`);
  return unwrap(res);
}
export async function adminUnpublishPost(id) {
  const res = await api.post(`/api/admin/content/posts/${id}/unpublish`);
  return unwrap(res);
}
export async function adminGetPost(id) {
  const res = await api.get(`/api/admin/content/posts/${id}`);
  return unwrap(res);
}

// ------- Public -------
export async function publicListPosts(params = {}) {
  const res = await api.get("/api/public/content/posts", { params });
  const data = unwrap(res);
  return unwrapList(data);
}
export async function publicListPostsPaged(params = {}) {
  const res = await api.get("/api/public/content/posts", { params });
  const data = unwrap(res);
  const items = unwrapList(data);
  const meta = data?.meta ?? fallbackMeta(items);
  return { items, meta };
}
export async function publicGetPostBySlug(slug) {
  const res = await api.get(`/api/public/content/posts/${slug}`);
  return unwrap(res);
}

// ------- App (authenticated) -------
export async function appCreatePost(payload) {
  const res = await api.post("/api/app/content/posts", payload);
  return unwrap(res);
}
