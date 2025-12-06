import { z } from "zod"

export const createInstructorRequestSchema = z.object({
  bio: z
    .string()
    .min(1, "Bio là bắt buộc")
    .min(10, "Bio phải có ít nhất 10 ký tự")
    .max(5000, "Bio không được vượt quá 5000 ký tự") // Increased for HTML content
    .transform(val => val?.trim() || ""),
  expertise: z
    .string()
    .min(1, "Chuyên môn là bắt buộc")
    .min(5, "Chuyên môn phải có ít nhất 5 ký tự")
    .max(255, "Chuyên môn không được vượt quá 255 ký tự")
    .transform(val => val?.trim() || ""),
  experienceYears: z
    .number({
      required_error: "Số năm kinh nghiệm là bắt buộc",
      invalid_type_error: "Số năm kinh nghiệm phải là số"
    })
    .int("Số năm kinh nghiệm phải là số nguyên")
    .min(0, "Số năm kinh nghiệm phải lớn hơn hoặc bằng 0")
    .max(50, "Số năm kinh nghiệm không được vượt quá 50")
    .transform(val => isNaN(val) ? 0 : val),
  qualification: z
    .string()
    .min(1, "Bằng cấp là bắt buộc")
    .min(5, "Bằng cấp phải có ít nhất 5 ký tự")
    .max(255, "Bằng cấp không được vượt quá 255 ký tự")
    .transform(val => val?.trim() || ""),
  reason: z
    .string()
    .min(1, "Lý do là bắt buộc")
    .min(10, "Lý do phải có ít nhất 10 ký tự")
    .max(500, "Lý do không được vượt quá 400 ký tự")
    .transform(val => val?.trim() || ""),
})

export const uploadProofsSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, "Vui lòng chọn ít nhất một file")
    .max(10, "Chỉ được tải lên tối đa 10 file")
    .refine(
      (files) => {
        const maxSize = 5 * 1024 * 1024 // 5MB
        return files.every(file => file.size <= maxSize)
      },
      {
        message: "Kích thước file không được vượt quá 5MB",
      }
    )
    .refine(
      (files) => {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
        return files.every(file => allowedTypes.includes(file.type))
      },
      {
        message: "Chỉ chấp các định dạng file: PNG, JPG, WebP, PDF",
      }
    ),
})

export const instructorValidationMessages = {
  bio: {
    required: "Bio là bắt buộc",
    minLength: "Bio phải có ít nhất 10 ký tự",
    maxLength: "Bio không được vượt quá 5000 ký tự",
  },
  expertise: {
    required: "Chuyên môn là bắt buộc",
    minLength: "Chuyên môn phải có ít nhất 5 ký tự",
    maxLength: "Chuyên môn không được vượt quá 255 ký tự",
  },
  experienceYears: {
    required: "Số năm kinh nghiệm là bắt buộc",
    min: "Số năm kinh nghiệm phải là số nguyên dương",
    max: "Số năm kinh nghiệm không được vượt quá 50",
  },
  qualification: {
    required: "Bằng cấp là bắt buộc",
    minLength: "Bằng cấp phải có ít nhất 5 ký tự",
    maxLength: "Bằng cấp không được vượt quá 255 ký tự",
  },
  reason: {
    required: "Lý do là bắt buộc",
    minLength: "Lý do phải có ít nhất 10 ký tự",
    maxLength: "Lý do không được vượt quá 500 ký tự",
  },
  files: {
    required: "Vui lòng chọn ít nhất một file",
    maxFiles: "Chỉ được tải lên tối đa 10 file",
    maxSize: "Kích thước file không được vượt quá 5MB",
    fileTypes: "Chỉ chấp các định dạng file: PNG, JPG, WebP, PDF",
  },
}