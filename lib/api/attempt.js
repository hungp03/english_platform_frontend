import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

/**
 * Nộp bài quiz (one-shot submit)
 */
export async function submitOneShot(payload) {
  try {
    const res = await api.post(`/api/assessment/attempts/submit`, payload);
    if (res.status === 200 || res.status === 201) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể nộp bài" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể nộp bài";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để nộp bài.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài quiz hoặc câu hỏi.";
        break;
      case ErrorCode.METHOD_NOT_VALID:
        errorMessage = "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy danh sách bài làm của người dùng hiện tại
 */
export async function listMyAttempts({ page = 1, size = 20, quizId = null } = {}) {
  try {
    const res = await api.get("/api/assessment/attempts/my", {
      params: {
        page,
        size,
        ...(quizId && { quizId }),
      },
    });

    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }

    return { success: false, error: "Không thể lấy danh sách bài làm" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách bài làm";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem danh sách bài làm.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}


/**
 * Lấy danh sách bài làm theo quiz
 */
export async function listAttemptsByQuiz({ quizId, page = 1, size = 20 }) {
  try {
    const res = await api.get("/api/assessment/attempts", {
      params: {
        quizId,
        page,
        size,
      },
    });

    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }

    return { success: false, error: "Không thể lấy danh sách bài làm" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy danh sách bài làm";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem danh sách bài làm.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy chi tiết bài làm theo ID
 */
export async function getAttempt(attemptId) {
  try {
    const res = await api.get(`/api/assessment/attempts/${attemptId}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy thông tin bài làm" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy thông tin bài làm";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem thông tin bài làm.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài làm.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy chi tiết câu trả lời và kết quả của bài làm
 */
export async function getAttemptAnswers(attemptId) {
  try {
    const res = await api.get(`/api/assessment/attempts/${attemptId}/answers`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy đáp án bài làm" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy đáp án bài làm";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem đáp án.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài làm hoặc quiz.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Upload audio và submit bài speaking
 */
export async function submitSpeaking(attemptId, answerId, audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.mp3');
    
    const res = await fetch(
      `/api/assessment/attempts/${attemptId}/answers/${answerId}/speaking`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      }
    );
    
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: data?.data || data };
    }
    
    const errorData = await res.json().catch(() => ({}));
    const code = errorData?.code;
    let errorMessage = "Không thể submit speaking";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để nộp bài speaking.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài làm hoặc câu trả lời.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền nộp bài này.";
        break;
      case ErrorCode.RESOURCE_INVALID:
        errorMessage = "File audio không hợp lệ hoặc câu trả lời không thuộc bài làm này.";
        break;
      case ErrorCode.RESOURCE_ALREADY_EXISTS:
        errorMessage = "Bài speaking đã được nộp trước đó.";
        break;
      default:
        errorMessage = errorData?.message || "Không thể submit speaking";
        break;
    }
    return { success: false, error: errorMessage };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể submit speaking" };
  }
}

/**
 * Lấy chi tiết kết quả bài speaking
 */
export async function getSpeakingResults(submissionId) {
  try {
    const res = await api.get(`/api/assessment/speaking-submissions/${submissionId}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy kết quả speaking" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy kết quả speaking";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem kết quả.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài speaking.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xem kết quả này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Submit bài writing (tạo WritingSubmission)
 */
export async function submitWriting(attemptId, answerId) {
  try {
    const res = await api.post(
      `/api/assessment/attempts/${attemptId}/answers/${answerId}/writing`
    );
    if (res.status === 200 || res.status === 201) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể submit writing" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể submit writing";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để nộp bài writing.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài làm hoặc câu trả lời.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền nộp bài này.";
        break;
      case ErrorCode.RESOURCE_INVALID:
        errorMessage = "Nội dung bài viết trống hoặc không hợp lệ.";
        break;
      case ErrorCode.RESOURCE_ALREADY_EXISTS:
        errorMessage = "Bài writing đã được nộp trước đó.";
        break;
      default:
        errorMessage = err?.response?.data?.message || "Không thể submit writing";
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy chi tiết kết quả bài writing theo submission ID
 */
export async function getWritingResults(submissionId) {
  try {
    const res = await api.get(`/api/assessment/writing-submissions/${submissionId}`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy kết quả writing" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy kết quả writing";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem kết quả.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài writing.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xem kết quả này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy kết quả bài writing theo answer ID
 */
export async function getWritingResultsByAnswer(attemptId, answerId) {
  try {
    const res = await api.get(
      `/api/assessment/attempts/${attemptId}/answers/${answerId}/writing`
    );
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy kết quả writing" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy kết quả writing";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem kết quả.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài làm hoặc câu trả lời.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xem kết quả này.";
        break;
      case ErrorCode.RESOURCE_INVALID:
        errorMessage = "Câu trả lời không thuộc bài làm này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy tất cả bài writing submissions của một attempt
 */
export async function getWritingSubmissions(attemptId) {
  try {
    const res = await api.get(`/api/assessment/attempts/${attemptId}/writing-submissions`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy kết quả writing" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy kết quả writing";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem kết quả.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài làm.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xem kết quả này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy tất cả bài speaking submissions của một attempt
 */
export async function getSpeakingSubmissions(attemptId) {
  try {
    const res = await api.get(`/api/assessment/attempts/${attemptId}/speaking-submissions`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể lấy kết quả speaking" };
  } catch (err) {
    console.error(err);
    const code = err?.response?.data?.code;
    let errorMessage = "Không thể lấy kết quả speaking";

    switch (code) {
      case ErrorCode.EXCEPTION:
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau.";
        break;
      case ErrorCode.UNAUTHORIZED:
        errorMessage = "Bạn cần đăng nhập để xem kết quả.";
        break;
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Không tìm thấy bài làm.";
        break;
      case ErrorCode.FORBIDDEN:
        errorMessage = "Bạn không có quyền xem kết quả này.";
        break;
      default:
        break;
    }
    return { success: false, error: errorMessage };
  }
}
/**
 * Retry chấm điểm speaking
 */
export async function retrySpeakingGrading(submissionId) {
  try {
    const res = await api.post(`/api/assessment/speaking-submissions/${submissionId}/retry`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể retry chấm điểm" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err?.response?.data?.message || "Không thể retry chấm điểm" };
  }
}

/**
 * Retry chấm điểm writing
 */
export async function retryWritingGrading(submissionId) {
  try {
    const res = await api.post(`/api/assessment/writing-submissions/${submissionId}/retry`);
    if (res.status === 200) {
      return { success: true, data: res.data?.data || res.data };
    }
    return { success: false, error: "Không thể retry chấm điểm" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err?.response?.data?.message || "Không thể retry chấm điểm" };
  }
}
