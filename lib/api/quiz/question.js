import api from "@/lib/axios";

export async function listQuestionsByQuiz(quizId, { page=1, pageSize=10 } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("size", pageSize);
  const res = await api.get(`/api/admin/quiz/questions/by-quiz/${quizId}?${params.toString()}`);
  return res.data; // PaginationResponse
}
export async function getQuestion(id) {
  const res = await api.get(`/api/admin/quiz/questions/${id}`);
  return res.data;
}
export async function createQuestion(payload) {
  const res = await api.post(`/api/admin/quiz/questions`, payload);
  return res.data;
}
export async function updateQuestion(id, payload) {
  const res = await api.patch(`/api/admin/quiz/questions/${id}`, payload);
  return res.data;
}
export async function deleteQuestion(id) {
  const res = await api.delete(`/api/admin/quiz/questions/${id}`);
  return res.data;
}