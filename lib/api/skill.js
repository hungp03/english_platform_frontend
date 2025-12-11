import api from "@/lib/axios";

export async function getAllSkills() {
  try {
    const res = await api.get("/api/skills");
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy danh sách kỹ năng" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy danh sách kỹ năng" };
  }
}

export async function createSkill(name) {
  try {
    const res = await api.post("/api/skills", { name });
    if (res.status === 201) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể tạo kỹ năng" };
  } catch (err) {
    console.error(err);
    const backendMessage = err?.response?.data?.message;
    let errorMessage = "Không thể tạo kỹ năng";
    
    if (backendMessage?.includes("already exists")) {
      errorMessage = "Kỹ năng đã tồn tại";
    } else if (backendMessage?.includes("required")) {
      errorMessage = "Tên kỹ năng không được để trống";
    } else if (backendMessage?.includes("exceed")) {
      errorMessage = "Tên kỹ năng quá dài";
    }
    
    return { success: false, error: errorMessage };
  }
}

export async function updateSkill(id, name) {
  try {
    const res = await api.put(`/api/skills/${id}`, { name });
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể cập nhật kỹ năng" };
  } catch (err) {
    console.error(err);
    const backendMessage = err?.response?.data?.message;
    let errorMessage = "Không thể cập nhật kỹ năng";
    
    if (backendMessage?.includes("already exists")) {
      errorMessage = "Kỹ năng đã tồn tại";
    } else if (backendMessage?.includes("not found")) {
      errorMessage = "Không tìm thấy kỹ năng";
    } else if (backendMessage?.includes("required")) {
      errorMessage = "Tên kỹ năng không được để trống";
    }
    
    return { success: false, error: errorMessage };
  }
}

export async function deleteSkill(id) {
  try {
    const res = await api.delete(`/api/skills/${id}`);
    if (res.status === 204) {
      return { success: true };
    }
    return { success: false, error: "Không thể xóa kỹ năng" };
  } catch (err) {
    console.error(err);
    const backendMessage = err?.response?.data?.message;
    let errorMessage = "Không thể xóa kỹ năng";
    
    if (backendMessage?.includes("being used")) {
      errorMessage = "Không thể xóa kỹ năng đang được sử dụng bởi các khóa học";
    } else if (backendMessage?.includes("not found")) {
      errorMessage = "Không tìm thấy kỹ năng";
    }
    
    return { success: false, error: errorMessage };
  }
}
