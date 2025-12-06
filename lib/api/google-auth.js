import api from "@/lib/axios"

export async function linkGoogleAccount(authorizationCode) {
    if (!authorizationCode) {
        return { error: "Authorization code không hợp lệ" }
    }

    try {
        const res = await api.post("/api/auth/link-google-account", {
            authorizationCode,
            redirectUri: "postmessage"
        })

        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        const status = err?.response?.status
        const message = err?.response?.data?.message || err?.response?.data?.error

        if (status === 400) {
            if (message?.includes("already linked")) {
                return { error: "Tài khoản của bạn đã được liên kết với một nhà cung cấp khác" }
            }
            return { error: "Token Google không hợp lệ hoặc đã hết hạn" }
        }

        if (status === 401) {
            return { error: "Vui lòng đăng nhập để liên kết tài khoản Google" }
        }

        if (status === 409) {
            return { error: "Tài khoản Google này đã được liên kết với người dùng khác" }
        }

        return { error: message || "Không thể liên kết tài khoản Google. Vui lòng thử lại" }
    }
}


export async function unlinkGoogleAccount() {
    try {
        const res = await api.post("/api/auth/unlink-google-account")

        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        const status = err?.response?.status
        const message = err?.response?.data?.message || err?.response?.data?.error

        if (status === 400) {
            return { error: "Tài khoản chưa được liên kết với Google" }
        }

        if (status === 401) {
            return { error: "Vui lòng đăng nhập để hủy liên kết tài khoản Google" }
        }

        return { error: message || "Không thể hủy liên kết tài khoản Google. Vui lòng thử lại" }
    }
}
