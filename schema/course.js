import { z } from "zod"

export const courseSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc").max(255, "Tiêu đề không quá 255 ký tự"),

  description: z.string().max(255, "Mô tả không quá 255 ký tự").optional(),

  detailedDescription: z.string().optional(),

  language: z.string().min(1, "Ngôn ngữ là bắt buộc").max(10, "Mã ngôn ngữ quá dài"),

  thumbnail: z.string().optional(),

  skillFocus: z
    .array(z.string().min(1, "Kỹ năng không được rỗng"))
    .nonempty("Vui lòng chọn hoặc nhập ít nhất 1 kỹ năng")
    .max(10, "Tối đa 10 kỹ năng")
    .refine(
      (arr) => {
        const norm = arr.map((s) => s.trim().toLocaleLowerCase())
        return new Set(norm).size === norm.length
      },
      { message: "Danh sách kỹ năng bị trùng (không phân biệt hoa/thường)" }
    ),

  priceCents: z
    .string()
    .min(1, "Giá là bắt buộc")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Giá phải >= 0")
    .transform((val) => Number(val)),

  currency: z
    .string()
    .min(1, "Tiền tệ là bắt buộc")
    // Temporarily only allow VND currency
    .refine((val) => val === "VND", "Hiện tại chỉ hỗ trợ tiền tệ VND"),
    // .regex(/^[A-Z]{3}$/, "Tiền tệ phải gồm 3 chữ in hoa (VD: VND, USD)"),
})


export const moduleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tiêu đề module")
    .max(255, "Tiêu đề không quá 255 ký tự"),
  position: z
    .string()
    .trim()
    .min(1, "Số thứ tự là bắt buộc")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 1,
      "Số thứ tự phải là số lớn hơn hoặc bằng 1"
    )
    .transform((val) => Number(val)),
})

export const lessonSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(255, "Tiêu đề tối đa 255 ký tự"),
  kind: z.enum(["VIDEO", "TEXT", "QUIZ"], {
    required_error: "Vui lòng chọn loại bài học",
  }),
  estimatedMin: z
    .number({ invalid_type_error: "Thời lượng phải là số" })
    .min(1, "Thời lượng ít nhất 1 phút"),
  position: z
    .union([
      z.string().transform((val) => {
        if (val === "" || val === undefined) return undefined
        const num = Number(val)
        if (isNaN(num)) return undefined
        return num
      }),
      z.number()
    ])
    .optional()
    .refine(
      (val) => val === undefined || (typeof val === "number" && val >= 1),
      { message: "Thứ tự phải >= 1" }
    ),
  isFree: z.boolean({
    required_error: "Vui lòng chọn trạng thái miễn phí",
  }),
  content: z.object({
    type: z.enum(["html", "quiz"], {
      required_error: "Loại nội dung là bắt buộc"
    }),
    body: z.union([
      // For HTML content (VIDEO, TEXT)
      z.object({
        intro: z.string().optional(),
        sections: z.array(
          z.object({
            title: z.string().optional(),
            html: z.string()
          })
        ).optional()
      }),
      // For QUIZ content
      z.object({
        questions: z.array(
          z.object({
            question: z.string().min(1, "Câu hỏi không được trống"),
            options: z.array(z.string()).min(2, "Phải có ít nhất 2 lựa chọn"),
            answer: z.number().min(0, "Câu trả lời không hợp lệ")
          })
        ).min(1, "Phải có ít nhất 1 câu hỏi")
      })
    ])
  }),
  mediaId: z.string().uuid("ID media không hợp lệ").optional().or(z.literal("")).nullable(),
})