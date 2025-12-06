import { z } from "zod";

export const questionOptionSchema = z.object({
  content: z.string().min(1, "Nội dung không được để trống").max(1000, "Nội dung tối đa 1000 ký tự"),
  correct: z.boolean(),
  orderIndex: z.number().int().optional(),
});

export const questionCreateSchema = z.object({
  quizId: z.string().uuid("Quiz ID không hợp lệ"),
  content: z.string().min(1, "Nội dung câu hỏi không được để trống").max(2000, "Nội dung tối đa 2000 ký tự"),
  orderIndex: z.number().int("Thứ tự phải là số nguyên").min(1, "Thứ tự phải lớn hơn hoặc bằng 1"),
  explanation: z.string().max(2000, "Giải thích tối đa 2000 ký tự").optional(),
  options: z.array(questionOptionSchema).optional(),
});
