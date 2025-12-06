import { z } from "zod"

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Họ tên không được để trống")
      .regex(/^[\p{L}\s]+$/u, "Chỉ được chứa chữ và khoảng trắng"),

    email: z
      .string()
      .min(1, "Email không được để trống")
      .email("Email không hợp lệ"),

    password: z
      .string()
      .min(8, "Tối thiểu 8 ký tự")
      .regex(/^\S{8,}$/, "Không được chứa khoảng trắng"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  })
