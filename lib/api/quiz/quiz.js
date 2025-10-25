import api from "@/lib/axios";

export async function searchQuizzes({ page=1, pageSize=10, keyword="", quizTypeId=null, status=null, skill=null }) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("size", pageSize);
  if (keyword) params.set("keyword", keyword);
  if (quizTypeId) params.set("quizTypeId", quizTypeId);
  if (status) params.set("status", status);
  if (skill) params.set("skill", skill);
  const res = await api.get(`/api/admin/quiz/quizzes?${params.toString()}`);
  return res.data; // Expects PaginationResponse
}
export async function getQuiz(id) {
  const res = await api.get(`/api/admin/quiz/quizzes/${id}`);
  return res.data;
}
export async function createQuiz(payload) {
  const res = await api.post(`/api/admin/quiz/quizzes`, payload);
  return res.data;
}
export async function updateQuiz(id, payload) {
  const res = await api.patch(`/api/admin/quiz/quizzes/${id}`, payload);
  return res.data;
}
export async function deleteQuiz(id) {
  const res = await api.delete(`/api/admin/quiz/quizzes/${id}`);
  return res.data;
}