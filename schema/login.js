import { z } from "zod"

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { message: "Email là bắt buộc" })
    .email({ message: "Email không hợp lệ" }),
  password: z
    .string()
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
    .regex(/^\S+$/, { message: "Mật khẩu không được chứa khoảng trắng" }),
})