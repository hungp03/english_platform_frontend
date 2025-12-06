import { z } from "zod"

/**
 * Blog Post Create Schema (User)
 * POST /api/blog/posts
 * Based on backend validation:
 * - title: required, max 300 characters
 * - bodyMd: required, not blank
 * - categoryIds: optional array of UUIDs
 */
export const blogPostCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(300, "Tiêu đề không được vượt quá 300 ký tự")
    .transform(val => val?.trim() || ""),
  
  bodyMd: z
    .string()
    .min(1, "Nội dung không được để trống")
    .transform(val => val?.trim() || ""),
  
  categoryIds: z
    .array(z.string().uuid("ID danh mục không hợp lệ"))
    .optional()
    .default([]),

  slug: z
    .string()
    .optional()
    .transform(val => val?.trim() || undefined)
})

/**
 * Blog Post Update Schema (Admin)
 * PATCH /api/blog/posts/admin/{id}
 * All fields are optional (partial update)
 */
export const blogPostUpdateSchema = z.object({
  title: z
    .string()
    .max(300, "Tiêu đề không được vượt quá 300 ký tự")
    .transform(val => val?.trim() || undefined)
    .optional(),
  
  bodyMd: z
    .string()
    .min(1, "Nội dung không được để trống")
    .transform(val => val?.trim() || undefined)
    .optional(),
  
  categoryIds: z
    .array(z.string().uuid("ID danh mục không hợp lệ"))
    .optional(),

  slug: z
    .string()
    .transform(val => val?.trim() || undefined)
    .optional()
})

/**
 * Blog Category Create Schema
 * POST /api/blog/categories
 * Based on backend validation:
 * - name: required, max 255 characters
 * - slug: optional (auto-generated if not provided)
 * - description: optional
 */
export const blogCategoryCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Tên danh mục không được để trống")
    .max(255, "Tên danh mục không được vượt quá 255 ký tự")
    .transform(val => val?.trim() || ""),
  
  slug: z
    .string()
    .transform(val => val?.trim() || undefined)
    .optional(),
  
  description: z
    .string()
    .transform(val => val?.trim() || undefined)
    .optional()
})

/**
 * Blog Category Update Schema
 * PATCH /api/blog/categories/{id}
 * All fields are optional (partial update)
 */
export const blogCategoryUpdateSchema = z.object({
  name: z
    .string()
    .max(255, "Tên danh mục không được vượt quá 255 ký tự")
    .transform(val => val?.trim() || undefined)
    .optional(),
  
  slug: z
    .string()
    .transform(val => val?.trim() || undefined)
    .optional(),
  
  description: z
    .string()
    .transform(val => val?.trim() || undefined)
    .optional()
})

/**
 * Blog Comment Create Schema
 * POST /api/blog/comments/post/{postId}
 * Based on backend validation:
 * - bodyMd: required, not blank
 * - parentId: optional UUID for replies
 */
export const blogCommentCreateSchema = z.object({
  bodyMd: z
    .string()
    .min(1, "Nội dung bình luận không được để trống")
    .transform(val => val?.trim() || ""),
  
  parentId: z
    .string()
    .uuid("ID bình luận cha không hợp lệ")
    .optional()
})

/**
 * Validation messages for easy reference
 */
export const blogValidationMessages = {
  post: {
    title: {
      required: "Tiêu đề không được để trống",
      maxLength: "Tiêu đề không được vượt quá 300 ký tự",
    },
    body: {
      required: "Nội dung không được để trống",
    },
    categoryIds: {
      invalid: "ID danh mục không hợp lệ",
    },
  },
  category: {
    name: {
      required: "Tên danh mục không được để trống",
      maxLength: "Tên danh mục không được vượt quá 255 ký tự",
    },
  },
  comment: {
    body: {
      required: "Nội dung bình luận không được để trống",
    },
    parentId: {
      invalid: "ID bình luận cha không hợp lệ",
    },
  },
}
