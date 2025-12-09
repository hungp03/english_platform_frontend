import { z } from "zod";

export const voucherSchema = z
  .object({
    code: z
      .string()
      .min(3, "Mã voucher phải có ít nhất 3 ký tự")
      .max(50, "Mã voucher không quá 50 ký tự")
      .regex(
        /^[A-Z0-9_-]+$/,
        "Mã chỉ chứa chữ in hoa, số, gạch ngang và gạch dưới"
      ),

    scope: z.enum(["ALL_INSTRUCTOR_COURSES", "SPECIFIC_COURSES"], {
      required_error: "Vui lòng chọn phạm vi áp dụng",
    }),

    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"], {
      required_error: "Vui lòng chọn loại giảm giá",
    }),

    discountValue: z
      .string()
      .min(1, "Giá trị giảm là bắt buộc")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Giá trị giảm phải lớn hơn 0",
      }),

    maxDiscountAmount: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        { message: "Giới hạn giảm tối đa phải >= 0" }
      ),

    minOrderAmount: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        { message: "Đơn hàng tối thiểu phải >= 0" }
      ),

    usageLimit: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
        { message: "Giới hạn sử dụng phải > 0" }
      ),

    usagePerUser: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
        { message: "Lượt/người dùng phải > 0" }
      ),

    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),

    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),

    courseIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.discountType === "PERCENTAGE") {
        const value = Number(data.discountValue);
        return value <= 100;
      }
      return true;
    },
    {
      message: "Phần trăm giảm không được vượt quá 100%",
      path: ["discountValue"],
    }
  )
  .refine(
    (data) => {
      if (data.scope === "SPECIFIC_COURSES") {
        return data.courseIds && data.courseIds.length > 0;
      }
      return true;
    },
    {
      message: "Vui lòng chọn ít nhất một khóa học",
      path: ["courseIds"],
    }
  );

export const updateVoucherSchema = voucherSchema
  .omit({ code: true })
  .extend({
    status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
  });
