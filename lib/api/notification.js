import api from "@/lib/axios";

// Lấy danh sách thông báo (có phân trang)
export async function getNotifications({ page = 0, size = 20 } = {}) {
  try {
    const res = await api.get("/api/notifications", {
      params: { page: page, size: size }
    });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể tải thông báo" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Lỗi kết nối" };
  }
}

// Đăng ký FCM Token (để nhận push notification - chuẩn bị sẵn)
export async function registerFcmToken(token) {
  try {
    await api.post("/api/notifications/register-token", { token });
  } catch (err) {
    console.error("Register token error", err);
  }
}

// Đánh dấu 1 thông báo là đã đọc
export async function markRead(id) {
  try {
    await api.post(`/api/notifications/mark-read/${id}`);
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// Đánh dấu tất cả là đã đọc
export async function markAllRead() {
  try {
    await api.post("/api/notifications/mark-all-read");
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// Xóa 1 thông báo
export async function deleteNotification(id) {
  try {
    await api.delete(`/api/notifications/${id}`);
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// Xóa tất cả thông báo
export async function deleteAllNotifications() {
  try {
    await api.delete("/api/notifications");
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}