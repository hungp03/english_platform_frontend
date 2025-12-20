import api from "@/lib/axios";

// === Instructor Voucher APIs ===

export async function createVoucher(data) {
  try {
    const res = await api.post("/api/vouchers/instructor", data);
    if (res.status === 201) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể tạo voucher" };
  } catch (err) {
    console.error("Create voucher error:", err);
    const message = err?.response?.data?.message || "Không thể tạo voucher";
    return { success: false, error: message };
  }
}

export async function updateVoucher(voucherId, data) {
  try {
    const res = await api.put(`/api/vouchers/instructor/${voucherId}`, data);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể cập nhật voucher" };
  } catch (err) {
    console.error("Update voucher error:", err);
    const message = err?.response?.data?.message || "Không thể cập nhật voucher";
    return { success: false, error: message };
  }
}

export async function deleteVoucher(voucherId) {
  try {
    const res = await api.delete(`/api/vouchers/instructor/${voucherId}`);
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Không thể xóa voucher" };
  } catch (err) {
    console.error("Delete voucher error:", err);
    return { success: false, error: "Không thể xóa voucher" };
  }
}

export async function getVoucherById(voucherId) {
  try {
    const res = await api.get(`/api/vouchers/instructor/${voucherId}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy thông tin voucher" };
  } catch (err) {
    console.error("Get voucher error:", err);
    return { success: false, error: "Không thể lấy thông tin voucher" };
  }
}

export async function getMyVouchers(status = null, page = 1, size = 10) {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("page", page);
    params.append("size", size);
    params.append("sort", "createdAt,desc");

    const res = await api.get(`/api/vouchers/instructor?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách voucher" };
  } catch (err) {
    console.error("Get vouchers error:", err);
    return { success: false, error: "Không thể lấy danh sách voucher" };
  }
}

// === User Voucher APIs ===

export async function applyVoucher(code) {
  try {
    const res = await api.post("/api/vouchers/apply", { code });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể áp dụng voucher" };
  } catch (err) {
    console.error("Apply voucher error:", err);
    const message = err?.response?.data?.message || "Không thể áp dụng voucher";
    return { success: false, error: message };
  }
}

export async function applyVoucherDirect(code, courseId) {
  try {
    const res = await api.post("/api/vouchers/apply-direct", { code, courseId });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể áp dụng voucher" };
  } catch (err) {
    console.error("Apply voucher direct error:", err);
    const message = err?.response?.data?.message || "Không thể áp dụng voucher";
    return { success: false, error: message };
  }
}

export async function validateVoucher(code) {
  try {
    const res = await api.get(`/api/vouchers/validate?code=${encodeURIComponent(code)}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Voucher không hợp lệ" };
  } catch (err) {
    console.error("Validate voucher error:", err);
    return { success: false, error: "Voucher không hợp lệ" };
  }
}

export async function getCourseVouchers(courseId, page = 1, size = 5) {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);

    const res = await api.get(`/api/courses/${courseId}/vouchers?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách voucher" };
  } catch (err) {
    console.error("Get course vouchers error:", err);
    return { success: false, error: "Không thể lấy danh sách voucher" };
  }
}
