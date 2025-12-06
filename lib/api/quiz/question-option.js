import api from "@/lib/axios";

export async function createQuestionOption(questionId, payload) {
  const res = await api.post(`/api/admin/quiz/question-options/${questionId}`, payload);
  return res.data;
}
export async function getQuestionOption(id) {
  const res = await api.get(`/api/admin/quiz/question-options/${id}`);
  return res.data;
}
export async function updateQuestionOption(id, payload) {
  const res = await api.patch(`/api/admin/quiz/question-options/${id}`, payload);
  return res.data;
}
export async function deleteQuestionOption(id) {
  const res = await api.delete(`/api/admin/quiz/question-options/${id}`);
  return res.data;
}