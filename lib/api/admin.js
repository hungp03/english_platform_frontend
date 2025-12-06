import api from "@/lib/axios";

export async function getAdminWithdrawals({ state, page = 1, size = 20, sort = "createdAt,desc" } = {}) {
  try {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    params.append('page', page);
    params.append('size', size);
    params.append('sort', sort);

    const res = await api.get(`/api/admin/withdrawals?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách yêu cầu rút tiền" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy danh sách yêu cầu rút tiền" };
  }
}

export async function processWithdrawal(withdrawalId, status, adminNote) {
  try {
    const res = await api.put(`/api/admin/withdrawals/${withdrawalId}/process`, {
      status,
      adminNote: adminNote || null
    });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể xử lý yêu cầu rút tiền" };
  } catch (err) {
    console.error(err);
    const message = err?.response?.data?.message || "Không thể xử lý yêu cầu rút tiền";
    return { success: false, error: message };
  }
}
