import { z } from "zod";

export const quizCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(255, "Tiêu đề tối đa 255 ký tự"),
  description: z
    .string()
    .max(2000, "Mô tả tối đa 2000 ký tự")
    .optional()
    .or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], {
    required_error: "Vui lòng chọn trạng thái",
  }),
  quizTypeId: z
    .string()
    .uuid("Loại đề không hợp lệ")
    .refine((val) => val !== "none", {
      message: "Vui lòng chọn loại đề",
    }),
  quizSectionId: z
    .string()
    .uuid("Section không hợp lệ")
    .optional()
    .nullable(),
  contextText: z.string().optional().or(z.literal("")),
  skill: z.enum(["LISTENING", "READING", "SPEAKING", "WRITING"], {
    required_error: "Vui lòng chọn kỹ năng",
  }),
});

export const quizUpdateSchema = quizCreateSchema;
