import { z } from "zod"

/**
 * Forum Thread Create Schema
 * Based on backend validation:
 * - title: required, 5-255 characters
 * - bodyMd: required, 10-50000 characters
 * - categoryIds: required, 1-5 categories
 */
export const threadCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(255, "Tiêu đề không được vượt quá 255 ký tự")
    .transform(val => val?.trim() || ""),
  
  bodyMd: z
    .string()
    .min(1, "Nội dung không được để trống")
    .min(10, "Nội dung phải có ít nhất 10 ký tự")
    .max(50000, "Nội dung không được vượt quá 50,000 ký tự")
    .transform(val => val?.trim() || ""),
  
  categoryIds: z
    .array(z.string().uuid())
    .min(1, "Vui lòng chọn ít nhất 1 danh mục")
    .max(5, "Không thể chọn quá 5 danh mục")
})

/**
 * Forum Thread Update Schema
 * All fields are optional (partial update)
 * But if provided, must meet same validation rules
 */
export const threadUpdateSchema = z.object({
  title: z
    .string()
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(255, "Tiêu đề không được vượt quá 255 ký tự")
    .transform(val => val?.trim() || "")
    .optional(),
  
  bodyMd: z
    .string()
    .min(10, "Nội dung phải có ít nhất 10 ký tự")
    .max(50000, "Nội dung không được vượt quá 50,000 ký tự")
    .transform(val => val?.trim() || "")
    .optional(),
  
  categoryIds: z
    .array(z.string().uuid())
    .min(1, "Vui lòng chọn ít nhất 1 danh mục")
    .max(5, "Không thể chọn quá 5 danh mục")
    .optional()
})

/**
 * Forum Post (Reply) Create Schema
 * Used for replying to threads
 * Based on backend validation:
 * - bodyMd: required, 1-10000 characters
 */
export const postCreateSchema = z.object({
  bodyMd: z
    .string()
    .min(1, "Nội dung không được để trống")
    .max(10000, "Nội dung không được vượt quá 10,000 ký tự")
    .transform(val => val?.trim() || "")
})

/**
 * Forum Post Reply Schema (Reply to a post)
 * Same validation as post create
 */
export const postReplySchema = z.object({
  bodyMd: z
    .string()
    .min(1, "Nội dung không được để trống")
    .max(10000, "Nội dung không được vượt quá 10,000 ký tự")
    .transform(val => val?.trim() || "")
})

/**
 * Forum Report Create Schema
 * Based on backend validation:
 * - reason: required, 10-1000 characters
 */
export const reportCreateSchema = z.object({
  reason: z
    .string()
    .min(1, "Lý do báo cáo không được để trống")
    .min(10, "Lý do báo cáo phải có ít nhất 10 ký tự")
    .max(1000, "Lý do báo cáo không được vượt quá 1,000 ký tự")
    .transform(val => val?.trim() || "")
})

/**
 * Validation messages for easy reference
 */
export const forumValidationMessages = {
  thread: {
    title: {
      required: "Tiêu đề không được để trống",
      minLength: "Tiêu đề phải có ít nhất 5 ký tự",
      maxLength: "Tiêu đề không được vượt quá 255 ký tự",
    },
    body: {
      required: "Nội dung không được để trống",
      minLength: "Nội dung phải có ít nhất 10 ký tự",
      maxLength: "Nội dung không được vượt quá 50,000 ký tự",
    },
    categories: {
      required: "Vui lòng chọn ít nhất 1 danh mục",
      maxLength: "Không thể chọn quá 5 danh mục",
    },
  },
  post: {
    body: {
      required: "Nội dung không được để trống",
      maxLength: "Nội dung không được vượt quá 10,000 ký tự",
    },
  },
  report: {
    reason: {
      required: "Lý do báo cáo không được để trống",
      minLength: "Lý do báo cáo phải có ít nhất 10 ký tự",
      maxLength: "Lý do báo cáo không được vượt quá 1,000 ký tự",
    },
  },
}
