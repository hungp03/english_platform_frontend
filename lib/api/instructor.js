import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

export async function getUserInstructorRequests() {
  try {
    const res = await api.get(`/api/instructors/me/all`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Lấy danh sách yêu cầu thất bại" };
  } catch (err) {
    return { success: false, error: "Lấy danh sách yêu cầu thất bại" };
  }
}

export async function createInstructorRequest({ bio, expertise, experienceYears, qualification, reason }) {
  try {
    const res = await api.post(`/api/instructors`, {
      bio,
      expertise,
      experienceYears,
      qualification,
      reason
    });
    if (res.status === 201) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Tạo yêu cầu thất bại" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_ALREADY_EXISTS) {
      return { success: false, error: "Bạn đang có yêu cầu chờ duyệt, vui lòng thử lại sau" };
    }
    if (code == ErrorCode.RESOURCE_INVALID) {
      return { success: false, error: "Bạn đã là giảng viên" };
    }
    return { success: false, error: "Tạo yêu cầu thất bại" };
  }
}

export async function uploadProofs(files) {
  try {
    const formData = new FormData();

    // Append multiple files
    files.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('folder', 'certificate_proofs');

    const res = await api.post('/api/media/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Upload file thất bại" };
  } catch (err) {
    return { success: false, error: "Upload file thất bại" };
  }
}

export async function uploadCertificateProofs(requestId, fileUrls) {
  try {
    const res = await api.post(`/api/instructors/${requestId}/certificate-proofs`, {
      fileUrls
    });
    if (res.status === 201) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Tải lên chứng chỉ thất bại" };
  } catch (err) {
    return { success: false, error: "Tải lên chứng chỉ thất bại" };
  }
}

export async function getInstructorRequestsByUserAndId(requestId) {
  try {
    const res = await api.get(`/api/instructors/me/${requestId}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Lấy yêu cầu thất bại" };
  } catch (err) {
    return { success: false, error: "Lấy yêu cầu thất bại" };
  }
}

export async function updateInstructorRequest({requestId, bio, expertise, experienceYears, qualification, reason }) {
  try {
    const res = await api.patch(`/api/instructors/${requestId}`, {
      bio,
      expertise,
      experienceYears,
      qualification,
      reason
    });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Cập nhật yêu cầu thất bại" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy yêu cầu" };
    }
    if (code == ErrorCode.RESOURCE_INVALID) {
      return { success: false, error: "Bạn chỉ cập nhật được request đang chờ duyệt" };
    }
    return { success: false, error: "Cập nhật yêu cầu thất bại" };
  }
}

export async function deleteCertificateProof(requestId, proofId) {
  try {
    const res = await api.delete(`/api/instructors/${requestId}/certificate-proofs/${proofId}`);
    if (res.status === 200 || res.status === 204) {
      return { success: true };
    }
    return { success: false, error: "Xóa chứng chỉ thất bại" };
  } catch (err) {
    const message = "Xóa chứng chỉ thất bại";
    return { success: false, error: message };
  }
}

export async function deleteInstructorRequest(requestId) {
  try {
    const res = await api.delete(`/api/instructors/${requestId}`);
    if (res.status === 200 || res.status === 204) {
      return { success: true };
    }
    return { success: false, error: "Xóa yêu cầu thất bại" };
  } catch (err) {
    const message = "Xóa yêu cầu thất bại";
    return { success: false, error: message };
  }
}

// Admin APIs for instructor management
export async function getAdminInstructorRequests(status = null, page = 1, size = 10, sortDir = "desc") {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page);
    params.append('size', size);
    params.append('sort', `requestedAt,${sortDir}`);

    const res = await api.get(`/api/instructors/admin?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Lấy danh sách yêu cầu giảng viên thất bại" };
  } catch (err) {
    return { success: false, error: "Lấy danh sách yêu cầu giảng viên thất bại" };
  }
}

export async function getAdminInstructorRequestDetails(requestId) {
  try {
    const res = await api.get(`/api/instructors/admin/${requestId}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Lấy chi tiết yêu cầu giảng viên thất bại" };
  } catch (err) {
    return { success: false, error: "Lấy chi tiết yêu cầu giảng viên thất bại" };
  }
}

export async function reviewInstructorRequest(requestId, action, adminNotes) {
  try {
    const res = await api.patch(`/api/instructors/admin/${requestId}/review`, {
      action,
      adminNotes: adminNotes || null
    });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: action === "APPROVE" ? "Phê duyệt yêu cầu thất bại" : "Từ chối yêu cầu thất bại" };
  } catch (err) {
    return { success: false, error: action === "APPROVE" ? "Phê duyệt yêu cầu thất bại" : "Từ chối yêu cầu thất bại" };
  }
}

export async function getInstructorList(page = 1, size = 10, sortField = "createdAt", sortDir = "asc", search = null) {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('sort', `${sortField},${sortDir}`);
    if (search) params.append('search', search);

    const res = await api.get(`/api/instructors/list-instructors?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Lấy danh sách giảng viên thất bại" };
  } catch (err) {
    return { success: false, error: "Lấy danh sách giảng viên thất bại" };
  }
}

// === Public Instructor Endpoints ===
export async function getPublicInstructorOverview(userId) {
  if (!userId) return { success: false, error: "Thiếu userId giảng viên" };
  try {
    const res = await api.get(`/api/instructors/${userId}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy thông tin giảng viên" };
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_NOT_FOUND) {
      return { success: false, error: "Không tìm thấy giảng viên" };
    }
    return { success: false, error: "Không thể lấy thông tin giảng viên" };
  }
}

/**
 * Courses only: GET /api/instructors/{userId}/courses
 */
export async function getPublicInstructorCourses(userId, { page = 1, pageSize = 12, keyword, skills } = {}) {
  if (!userId) return { success: false, error: "Thiếu userId giảng viên" };
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (keyword) params.append("keyword", keyword);
    if (Array.isArray(skills)) {
      skills.forEach(s => params.append("skills", s));
    }
    const res = await api.get(`/api/instructors/${userId}/courses?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách khóa học của giảng viên" };
  } catch (err) {
    return { success: false, error: "Không thể lấy danh sách khóa học của giảng viên" };
  }
}

// === Wallet APIs ===
export async function getInstructorWalletBalance() {
  try {
    const res = await api.get("/api/instructor/wallet/balance");
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy số dư ví" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy số dư ví" };
  }
}

export async function getInstructorWalletTransactions(page = 1, size = 20) {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    
    const res = await api.get(`/api/instructor/wallet/transactions?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy lịch sử giao dịch" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy lịch sử giao dịch" };
  }
}

export async function getInstructorBankAccount() {
  try {
    const res = await api.get("/api/instructor/wallet/bank-account");
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy thông tin tài khoản" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy thông tin tài khoản" };
  }
}

export async function updateInstructorBankAccount(paypalEmail) {
  try {
    const res = await api.put("/api/instructor/wallet/bank-account", {
      paypalEmail
    });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể cập nhật thông tin tài khoản" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể cập nhật thông tin tài khoản" };
  }
}

export async function deleteInstructorBankAccount() {
  try {
    const res = await api.delete("/api/instructor/wallet/bank-account");
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Không thể xóa tài khoản" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể xóa tài khoản" };
  }
}

export async function createWithdrawal(amountCents, currency) {
  try {
    const res = await api.post("/api/instructor/wallet/withdrawals", {
      amountCents,
      currency
    });
    if (res.status === 201 || res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể tạo yêu cầu rút tiền" };
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === ErrorCode.RESOURCE_INVALID) {
      return { success: false, error: "Bạn chưa thêm tài khoản nhận tiền" };
    }
    const message = err?.response?.data?.message || "Không thể tạo yêu cầu rút tiền";
    return { success: false, error: message };
  }
}

export async function getWithdrawalHistory(page = 1, size = 20) {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    
    const res = await api.get(`/api/instructor/wallet/withdrawals?${params.toString()}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy lịch sử rút tiền" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy lịch sử rút tiền" };
  }
}

export async function cancelWithdrawal(withdrawalId) {
  try {
    const res = await api.delete(`/api/instructor/wallet/withdrawals/${withdrawalId}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể hủy yêu cầu rút tiền" };
  } catch (err) {
    console.error(err);
    const message = err?.response?.data?.message || "Không thể hủy yêu cầu rút tiền";
    return { success: false, error: message };
  }
}

export async function removeInstructorRole(userId, reason) {
  try {
    const res = await api.patch(`/api/instructors/admin/${userId}/role`, {
      action: "REVOKE",
      reason
    });
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Không thể thu hồi quyền giảng viên" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể thu hồi quyền giảng viên" };
  }
}

export async function restoreInstructorRole(userId, reason) {
  try {
    const res = await api.patch(`/api/instructors/admin/${userId}/role`, {
      action: "RESTORE",
      reason
    });
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Không thể khôi phục quyền giảng viên" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể khôi phục quyền giảng viên" };
  }
}
