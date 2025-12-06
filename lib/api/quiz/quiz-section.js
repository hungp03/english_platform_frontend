import api from "@/lib/axios";

// --- Admin (management) ---
export async function pageQuizSections({ page = 1, pageSize = 20, keyword = "" } = {}) {
  const p = new URLSearchParams({ page, pageSize });
  if (keyword) {
    p.set("keyword", keyword);
    // aliases để tương thích nếu backend đang đọc tên khác
    p.set("q", keyword);
    p.set("name", keyword);
  }
  const r = await api.get(`/api/admin/quiz/sections?${p}`);
  return r.data;
}

// Sections theo quiz type (admin)
export async function pageQuizSectionsByType(
  quizTypeId,
  { page = 1, pageSize = 20, keyword = "" } = {}
) {
  const p = new URLSearchParams({ page, pageSize });
  if (keyword) {
    p.set("keyword", keyword);
    p.set("q", keyword);
    p.set("name", keyword);
  }
  const r = await api.get(`/api/admin/quiz/sections/by-type/${quizTypeId}?${p}`);
  return r.data;
}

export async function getQuizSection(id) {
  const res = await api.get(`/api/admin/quiz/sections/${id}`);
  return res.data;
}

export async function createQuizSection(payload) {
  const res = await api.post(`/api/admin/quiz/sections`, payload);
  return res.data;
}

export async function updateQuizSection(id, payload) {
  const res = await api.put(`/api/admin/quiz/sections/${id}`, payload);
  return res.data;
}

export async function deleteQuizSection(id) {
  const res = await api.delete(`/api/admin/quiz/sections/${id}`);
  return res.data;
}

// --- Public ---
export async function listPublicQuizSectionsByType(quizTypeId, opts = {}) {
  const params = new URLSearchParams();
  const skill = opts?.skill;
  if (skill) params.set("skill", skill);
  const query = params.toString();
  const res = await api.get(`/api/quiz/types/${quizTypeId}/sections${query ? `?${query}` : ""}`);
  return res.data; // List<QuizSectionResponse>
}