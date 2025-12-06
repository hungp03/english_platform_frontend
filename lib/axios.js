import axios from "axios";

const BASE_URL = "/";
const REFRESH_PATH = "/api/auth/refresh";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
});

let isRefreshing = false;
let refreshPromise = null;
let queue = []; 

function enqueue(resolve, reject) {
  queue.push({ resolve, reject });
}
function flush(error) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  queue = [];
}

async function refreshOnce() {
  if (refreshPromise) return refreshPromise;

  isRefreshing = true;
  const url = BASE_URL.replace(/\/+$/, "") + REFRESH_PATH;

  refreshPromise = (async () => {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include", 
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
    });

    if (!res.ok) {
      let msg = "";
      try { msg = await res.text(); } catch {}
      throw new Error(`Refresh failed: ${res.status} ${msg}`);
    }
    return true;
  })();

  try {
    await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config || {};
    const status = error?.response?.status;

    // Không can thiệp nếu:
    // - Không phải 401
    // - Đã retry 1 lần (_retry)
    // - Đang gọi chính endpoint refresh
    const absRefresh = BASE_URL.replace(/\/+$/, "") + REFRESH_PATH;
    const isRefreshCall =
      originalRequest?.url === REFRESH_PATH ||
      originalRequest?.url === absRefresh;

    if (status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true; 

      if (isRefreshing || refreshPromise) {
        try {
          await new Promise((resolve, reject) => enqueue(resolve, reject));
          return api(originalRequest);
        } catch (e) {
          return Promise.reject(e);
        }
      }

      try {
        await refreshOnce();
        flush(null); 
        return api(originalRequest); 
      } catch (refreshErr) {
        flush(refreshErr);
        // (tùy chọn) chuyển hướng login:
        // if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        //   window.location.href = "/login";
        // }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API error:", err?.response?.data || err?.message || err);
    return Promise.reject(err);
  }
);

export default api;
