import api from "@/lib/axios";

export async function getUser() {
  try {
    const res = await api.get("/api/users/me");
    if (res.status === 200) return res.data?.data;
    return null;
  } catch {
    return null;
  }
}

export async function updateUser({ fullName, email, avatarUrl }) {
  try {
    const res = await api.put("/api/users/me", {
      fullName,
      email,
      avatarUrl,
    });
    if (res.status === 200) {
      return { success: true, data: res.data };
    }
    return { success: false, error: "Cập nhật thông tin thất bại" };
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      "Cập nhật thông tin thất bại. Vui lòng thử lại.";
    return { success: false, error: message };
  }
}

export async function changePassword(
  currentPassword,
  newPassword,
  confirmPassword
) {
  try {
    const res = await api.patch("/api/users/password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Đổi mật khẩu thất bại" };
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      "Mật khẩu hiện tại không đúng hoặc xác nhận mật khẩu không khớp.";
    return { success: false, error: message };
  }
}

export async function getUsers(page = 0, size = 10, searchTerm = "") {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    if (searchTerm) params.append("searchTerm", searchTerm);

    const res = await api.get(`/api/users?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data };
    }
    return { success: false, error: "Không lấy được danh sách người dùng" };
  } catch (err) {
    const message =
      err?.response?.data?.message || "Không lấy được danh sách người dùng";
    return { success: false, error: message };
  }
}

export async function toggleUserStatus(userId) {
  try {
    const res = await api.patch(`/api/users/${userId}/toggle-status`);
    if (res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Thay đổi trạng thái thất bại" };
  } catch (err) {
    const message =
      err?.response?.data?.message || "Thay đổi trạng thái thất bại";
    return { success: false, error: message };
  }
}
