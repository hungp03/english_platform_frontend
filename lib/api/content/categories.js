import api from "@/lib/axios";

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

// GET /api/admin/content/categories -> { data: { meta, result: [] } }
export async function listCategories(params = {}) {
  const res = await api.get("/api/admin/content/categories", { params });
  const data = unwrap(res);
  return Array.isArray(data?.result)
    ? data.result
    : Array.isArray(data?.content)
    ? data.content
    : Array.isArray(data)
    ? data
    : [];
}

export async function createCategory(payload) {
  const body = { ...payload };
  if (!body.slug || body.slug.trim() === "") delete body.slug;
  // Workaround nếu BE còn yêu cầu gán id thủ công:
  if (!body.id && typeof crypto !== "undefined" && crypto.randomUUID)
    body.id = crypto.randomUUID();
  const res = await api.post("/api/admin/content/categories", body);
  return unwrap(res);
}

export async function updateCategory(id, payload) {
  const res = await api.patch(`/api/admin/content/categories/${id}`, payload);
  return unwrap(res);
}

export async function deleteCategory(id) {
  const res = await api.delete(`/api/admin/content/categories/${id}`);
  return res?.status === 204 ? true : unwrap(res);
}

export async function getCategory(id) {
  const res = await api.get(`/api/admin/content/categories/${id}`);
  return unwrap(res);
}
