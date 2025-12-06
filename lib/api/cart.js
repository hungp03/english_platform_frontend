import api from "@/lib/axios";
import { ErrorCode } from "@/lib/constants";

export async function addToCart(courseId) {
  if (!courseId) {
    return { success: false, error: "Thiếu ID khóa học" };
  }
  try {
    const res = await api.post("/api/cart", {
      courseId: courseId,
    });

    if (res.status === 201) {
      return { success: true };
    }
    return { success: false, error: "Không thể thêm vào giỏ hàng" };
  } catch (err) {
    const code = err?.response?.data?.code
    let errorMessage = "Không thể thêm vào giỏ hàng"

    switch (code) {
      case ErrorCode.RESOURCE_NOT_FOUND:
        errorMessage = "Khóa học không tồn tại"
        break
      case ErrorCode.RESOURCE_INVALID:
        errorMessage = "Khóa học không khả dụng để mua"
        break
      case ErrorCode.RESOURCE_ALREADY_EXISTS:
        errorMessage = "Khóa học đã có trong giỏ hàng"
        break
      case ErrorCode.RESOURCE_ALREADY_OWNER:
        errorMessage = "Bạn đã mua khóa học trước đó"
        break
      default:
        console.error("Add to cart error:", err)
        break
    }
    return { success: false, error: errorMessage }
  }

}

export async function getCart() {
  try {
    const res = await api.get("/api/cart");
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy giỏ hàng" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy giỏ hàng" };
  }
}

export async function removeFromCart(courseId) {
  if (!courseId) {
    return { success: false, error: "Thiếu ID khóa học" };
  }
  try {
    const res = await api.delete(`/api/cart/courses/${courseId}`);
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Không thể xóa khỏi giỏ hàng" };
  } catch (err) {
    const code = err?.response?.data?.code
    let errorMessage = "Không thể xóa khỏi giỏ hàng"
    if (code === ErrorCode.RESOURCE_NOT_FOUND) { errorMessage = "Không tìm thấy khóa học trong giỏ hàng"; }
    return { success: false, error: errorMessage };
  }
}

export async function clearCart() {
  try {
    const res = await api.delete("/api/cart");
    if (res.status === 204 || res.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Không thể xóa giỏ hàng" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể xóa giỏ hàng" };
  }
}

export async function getCartCheckout() {
  try {
    const res = await api.get("/api/cart/checkout");
    if (res.status === 200) {
      return { success: true, data: res.data?.data };
    }
    return { success: false, error: "Không thể lấy thông tin thanh toán giỏ hàng" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Không thể lấy thông tin thanh toán giỏ hàng" };
  }
}
