import { z } from "zod"

// Schema for individual schedule item (for create - with future date check)
export const studyPlanScheduleSchema = z.object({
  id: z.string().uuid().optional(),
  startTime: z.string({
    required_error: "Thời gian bắt đầu là bắt buộc",
    invalid_type_error: "Thời gian bắt đầu phải là chuỗi ngày hợp lệ"
  })
    .min(1, "Thời gian bắt đầu là bắt buộc")
    .refine((val) => {
      const selectedDate = new Date(val)
      const now = new Date()
      return selectedDate > now
    }, {
      message: "Thời gian bắt đầu phải là thời điểm trong tương lai"
    }),
  durationMin: z.coerce
    .number({
      required_error: "Thời lượng là bắt buộc",
      invalid_type_error: "Thời lượng phải là một số"
    })
    .int("Thời lượng phải là số nguyên")
    .min(1, "Thời lượng phải ít nhất 1 phút"),
  taskDesc: z.string({
    required_error: "Mô tả nhiệm vụ là bắt buộc"
  }).min(1, "Mô tả nhiệm vụ là bắt buộc"),
  syncToCalendar: z.boolean().optional().default(false)
})

// Schema for individual schedule item (for update - with conditional future date check)
export const updateScheduleSchema = z.object({
  id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? undefined : val,
    z.string().uuid().optional()
  ),
  startTime: z.string({
    required_error: "Thời gian bắt đầu là bắt buộc",
    invalid_type_error: "Thời gian bắt đầu phải là chuỗi ngày hợp lệ"
  }).min(1, "Thời gian bắt đầu là bắt buộc"),
  durationMin: z.coerce
    .number({
      required_error: "Thời lượng là bắt buộc",
      invalid_type_error: "Thời lượng phải là một số"
    })
    .int("Thời lượng phải là số nguyên")
    .min(1, "Thời lượng phải ít nhất 1 phút"),
  taskDesc: z.string({
    required_error: "Mô tả nhiệm vụ là bắt buộc"
  }).min(1, "Mô tả nhiệm vụ là bắt buộc"),
  syncToCalendar: z.boolean().optional().default(false)
}).superRefine((data, ctx) => {
  // Only check future date for NEW schedules (without ID)
  if (!data.id) {
    const selectedDate = new Date(data.startTime)
    const now = new Date()
    if (selectedDate <= now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Thời gian bắt đầu phải là thời điểm trong tương lai",
        path: ["startTime"]
      })
    }
  }
})

// Schema for the complete study plan (create)
export const createStudyPlanSchema = z.object({
  title: z.string({
    required_error: "Tiêu đề là bắt buộc"
  })
    .min(1, "Tiêu đề là bắt buộc")
    .max(500, "Tiêu đề không được vượt quá 500 ký tự"),
  schedules: z.array(studyPlanScheduleSchema)
    .min(1, "Phải có ít nhất một lịch học")
})

// Schema for updating study plan (without future date check)
export const updateStudyPlanSchema = z.object({
  title: z.string({
    required_error: "Tiêu đề là bắt buộc"
  })
    .min(1, "Tiêu đề là bắt buộc")
    .max(500, "Tiêu đề không được vượt quá 500 ký tự"),
  schedules: z.array(updateScheduleSchema)
    .min(1, "Phải có ít nhất một lịch học")
})
