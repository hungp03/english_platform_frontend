import api from "@/lib/axios";

export async function uploadMedia(file, folder) {
  try {
    const form = new FormData();
    form.append("file", file, file.name);
    form.append("folder", folder);
    const res = await api.post("/api/media/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.status === 200) {
      const payload = res.data?.data ?? res.data;
      return { success: true, data: payload };
    }
    return { success: false, error: "Upload thất bại" };
  } catch (err) {
    const message = err?.response?.data?.message || "Upload thất bại";
    return { success: false, error: message };
  }
}

export async function uploadMultipleMedia(files, folder) {
  try {
    const form = new FormData();
    files.forEach((file) => form.append("files", file, file.name));
    form.append("folder", folder);
    const res = await api.post("/api/media/upload/multiple", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.status === 200) {
      const payload = res.data?.data ?? res.data;
      return { success: true, data: payload };
    }
    return { success: false, error: "Upload thất bại" };
  } catch (err) {
    const message = err?.response?.data?.message || "Upload thất bại";
    return { success: false, error: message };
  }
}

export async function deleteMediaByUrl(fileUrl) {
  try {
    const res = await api.delete("/api/media/delete", {
      params: { filename: fileUrl },
    });
    if (res.status === 200 || res.status === 204) return { success: true };
    return { success: false, error: "Xóa file thất bại" };
  } catch (err) {
    const message = err?.response?.data?.message || "Xóa file thất bại";
    return { success: false, error: message };
  }
}

/** New: list files in a folder (filter by extensions) */
export async function listMedia(folder, extensions) {
  try {
    const params = { folder };
    if (Array.isArray(extensions) && extensions.length)
      params.extensions = extensions.join(",");
    else if (typeof extensions === "string" && extensions.trim())
      params.extensions = extensions.trim();
    const res = await api.get("/api/media/list", { params });
    if (res.status === 200) {
      const payload = res.data?.data ?? res.data;
      return { success: true, data: payload };
    }
    return { success: false, error: "Lấy danh sách file thất bại" };
  } catch (err) {
    const message =
      err?.response?.data?.message || "Lấy danh sách file thất bại";
    return { success: false, error: message };
  }
}

/** New: delete entire folder and its contents */
export async function deleteMediaFolder(folder) {
  try {
    const res = await api.delete("/api/media/folder", { params: { folder } });
    if (res.status === 200 || res.status === 204) return { success: true };
    return { success: false, error: "Xóa folder thất bại" };
  } catch (err) {
    const message = err?.response?.data?.message || "Xóa folder thất bại";
    return { success: false, error: message };
  }
}
