import api from "@/lib/axios";

export async function getLearningProfile() {
  try {
    const res = await api.get("/api/v1/learning-profile");
    if (res.status === 200) return { success: true, data: res.data?.data || res.data };
    return { success: false, error: "Không lấy được thông tin" };
  } catch {
    return { success: false, data: null };
  }
}

export async function updateLearningProfile(data) {
  try {
    const res = await api.put("/api/v1/learning-profile", data);
    if (res.status === 200) return { success: true, data: res.data };
    return { success: false, error: "Cập nhật thất bại" };
  } catch (err) {
    return { success: false, error: err?.response?.data?.message || "Cập nhật thất bại" };
  }
}

export async function deleteLearningProfile() {
  try {
    const res = await api.delete("/api/v1/learning-profile");
    if (res.status === 204) return { success: true };
    return { success: false, error: "Xóa thất bại" };
  } catch (err) {
    return { success: false, error: err?.response?.data?.message || "Xóa thất bại" };
  }
}
