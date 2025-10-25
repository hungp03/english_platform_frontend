import api from "@/lib/axios";

export async function listQuizTypes() {
  const res = await api.get("/api/admin/quiz/types");
  return res.data;
}
export async function getQuizType(id) {
  const res = await api.get(`/api/admin/quiz/types/${id}`);
  return res.data;
}
export async function createQuizType(payload) {
  const res = await api.post("/api/admin/quiz/types", payload);
  return res.data;
}
export async function updateQuizType(id, payload) {
  const res = await api.patch(`/api/admin/quiz/types/${id}`, payload);
  return res.data;
}
export async function deleteQuizType(id) {
  const res = await api.delete(`/api/admin/quiz/types/${id}`);
  return res.data;
}