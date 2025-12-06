import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

export async function getUser() {
  try {
    const res = await api.get("/api/users/me");
    if (res.status === 200) return res.data?.data;
    return null;
  } catch {
    return null;
  }
}

export async function updateUser({ fullName, email, avatarFile }) {
  try {
    const formData = new FormData();
    if (fullName) formData.append("fullName", fullName);
    if (email) formData.append("email", email);
    if (avatarFile) formData.append("avatarFile", avatarFile);

    const res = await api.put("/api/users/me", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.status === 200) {
      return { success: true, data: res.data };
    }
    return { success: false, error: "Cập nhật thông tin thất bại" };
  } catch (err) {
    const message = "Cập nhật thông tin thất bại. Vui lòng thử lại.";
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
    const message = "Mật khẩu hiện tại không đúng hoặc xác nhận mật khẩu không khớp.";
    return { success: false, error: message };
  }
}

export async function getUsers({
  page = 1,
  size = 10,
  searchTerm = "",
  sortBy = "createdAt",
  sortDir = "DESC",
} = {}) {
  try {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("size", size);

    if (!searchTerm?.trim()) {
      params.append("sort", `${sortBy},${sortDir}`);
    } else {
      params.set("searchTerm", searchTerm.trim());
    }

    const res = await api.get(`/api/users?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data ?? res.data };
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