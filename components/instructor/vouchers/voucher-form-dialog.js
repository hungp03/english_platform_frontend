"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Info } from "lucide-react";
import { createVoucher, updateVoucher } from "@/lib/api/voucher";
import { getCourses } from "@/lib/api/course";
import { toast } from "sonner";
import { format } from "date-fns";
import { voucherSchema, updateVoucherSchema } from "@/schema/voucher";

export default function VoucherFormDialog({ open, onOpenChange, voucher, onSuccess }) {
  const isEdit = !!voucher;
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? updateVoucherSchema : voucherSchema),
    defaultValues: {
      code: "",
      scope: "SPECIFIC_COURSES",
      discountType: "PERCENTAGE",
      discountValue: "",
      maxDiscountAmount: "",
      minOrderAmount: "",
      usageLimit: "",
      usagePerUser: "1",
      startDate: "",
      endDate: "",
      courseIds: [],
    },
  });

  const watchScope = watch("scope");
  const watchDiscountType = watch("discountType");
  const watchCourseIds = watch("courseIds");

  // Fetch instructor courses
  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const result = await getCourses({ size: 100, status: "PUBLISHED" });
      if (result.success) {
        setCourses(result.data.result || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchCourses();
      if (voucher) {
        // Edit mode - populate form
        reset({
          code: voucher.code || "",
          scope: voucher.scope || "SPECIFIC_COURSES",
          discountType: voucher.discountType || "PERCENTAGE",
          discountValue: voucher.discountValue?.toString() || "",
          maxDiscountAmount: voucher.maxDiscountAmount?.toString() || "",
          minOrderAmount: voucher.minOrderAmount?.toString() || "",
          usageLimit: voucher.usageLimit?.toString() || "",
          usagePerUser: voucher.usagePerUser?.toString() || "1",
          startDate: voucher.startDate
            ? format(new Date(voucher.startDate), "yyyy-MM-dd'T'HH:mm")
            : "",
          endDate: voucher.endDate
            ? format(new Date(voucher.endDate), "yyyy-MM-dd'T'HH:mm")
            : "",
          courseIds: voucher.applicableCourses?.map((c) => c.id) || [],
        });
      } else {
        // Create mode - reset form
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        reset({
          code: "",
          scope: "SPECIFIC_COURSES",
          discountType: "PERCENTAGE",
          discountValue: "",
          maxDiscountAmount: "",
          minOrderAmount: "",
          usageLimit: "",
          usagePerUser: "1",
          startDate: format(now, "yyyy-MM-dd'T'HH:mm"),
          endDate: format(nextWeek, "yyyy-MM-dd'T'HH:mm"),
          courseIds: [],
        });
      }
    }
  }, [open, voucher, fetchCourses, reset]);

  const handleCourseToggle = useCallback(
    (courseId) => {
      const current = watchCourseIds || [];
      const updated = current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId];
      setValue("courseIds", updated, { shouldValidate: true });
    },
    [watchCourseIds, setValue]
  );

  const onSubmit = async (data) => {
    try {
      const payload = {
        code: data.code?.toUpperCase(),
        scope: data.scope,
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
        minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : null,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        usagePerUser: data.usagePerUser ? Number(data.usagePerUser) : 1,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        courseIds: data.scope === "SPECIFIC_COURSES" ? data.courseIds : [],
      };

      let result;
      if (isEdit) {
        const { code, ...updatePayload } = payload;
        result = await updateVoucher(voucher.id, updatePayload);
      } else {
        result = await createVoucher(payload);
      }

      if (result.success) {
        toast.success(isEdit ? "Đã cập nhật voucher" : "Đã tạo voucher");
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("Error submitting voucher:", err);
      toast.error("Đã xảy ra lỗi");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEdit ? "Chỉnh sửa voucher" : "Tạo voucher mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4 pb-4">
              {/* Code */}
              {!isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="code">Mã voucher *</Label>
                  <Input
                    id="code"
                    {...register("code", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toUpperCase();
                      },
                    })}
                    placeholder="VD: SALE20, NEWUSER50"
                    className={errors.code ? "border-red-500" : ""}
                  />
                  {errors.code && (
                    <p className="text-xs text-red-500">{errors.code.message}</p>
                  )}
                </div>
              )}

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Loại giảm giá *</Label>
                  <Controller
                    name="discountType"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                          <SelectItem value="FIXED_AMOUNT">Số tiền cố định (đ)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">Giá trị giảm *</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    step={watchDiscountType === "PERCENTAGE" ? "1" : "1000"}
                    {...register("discountValue")}
                    placeholder={watchDiscountType === "PERCENTAGE" ? "VD: 20" : "VD: 50000"}
                    className={errors.discountValue ? "border-red-500" : ""}
                  />
                  {errors.discountValue && (
                    <p className="text-xs text-red-500">{errors.discountValue.message}</p>
                  )}
                </div>
              </div>

              {/* Max Discount (only for percentage) */}
              {watchDiscountType === "PERCENTAGE" && (
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountAmount">Giảm tối đa (đ)</Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    min="0"
                    step="1000"
                    {...register("maxDiscountAmount")}
                    placeholder="VD: 100000 (để trống = không giới hạn)"
                  />
                  {errors.maxDiscountAmount && (
                    <p className="text-xs text-red-500">{errors.maxDiscountAmount.message}</p>
                  )}
                </div>
              )}

              {/* Min Order Amount */}
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Đơn hàng tối thiểu (đ)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  step="1000"
                  {...register("minOrderAmount")}
                  placeholder="VD: 200000 (để trống = không yêu cầu)"
                />
                {errors.minOrderAmount && (
                  <p className="text-xs text-red-500">{errors.minOrderAmount.message}</p>
                )}
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Tổng lượt dùng</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    {...register("usageLimit")}
                    placeholder="Không giới hạn"
                  />
                  {errors.usageLimit && (
                    <p className="text-xs text-red-500">{errors.usageLimit.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usagePerUser">Lượt/người dùng</Label>
                  <Input
                    id="usagePerUser"
                    type="number"
                    min="1"
                    {...register("usagePerUser")}
                    placeholder="1"
                  />
                  {errors.usagePerUser && (
                    <p className="text-xs text-red-500">{errors.usagePerUser.message}</p>
                  )}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Bắt đầu *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...register("startDate")}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  {errors.startDate && (
                    <p className="text-xs text-red-500">{errors.startDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Kết thúc *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register("endDate")}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-red-500">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {/* Scope */}
              <div className="space-y-2">
                <Label>Phạm vi áp dụng *</Label>
                <Controller
                  name="scope"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL_INSTRUCTOR_COURSES">
                          Tất cả khóa học của tôi
                        </SelectItem>
                        <SelectItem value="SPECIFIC_COURSES">Chọn khóa học cụ thể</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Course Selection */}
              {watchScope === "SPECIFIC_COURSES" && (
                <div className="space-y-2">
                  <Label>Chọn khóa học áp dụng *</Label>
                  {errors.courseIds && (
                    <p className="text-xs text-red-500">{errors.courseIds.message}</p>
                  )}

                  {coursesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      Bạn chưa có khóa học nào được xuất bản
                    </p>
                  ) : (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 border-b last:border-b-0"
                        >
                          <Checkbox
                            id={`course-${course.id}`}
                            checked={watchCourseIds?.includes(course.id)}
                            onCheckedChange={() => handleCourseToggle(course.id)}
                          />
                          <label
                            htmlFor={`course-${course.id}`}
                            className="flex-1 text-sm cursor-pointer"
                          >
                            {course.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  {watchCourseIds?.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Đã chọn {watchCourseIds.length} khóa học
                    </p>
                  )}
                </div>
              )}

              {/* Info Note */}
              <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Chi phí giảm giá sẽ được trừ vào doanh thu của bạn. Ví dụ: Khóa học 500.000đ,
                  giảm 20% = bạn nhận doanh thu từ 400.000đ.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Lưu thay đổi" : "Tạo voucher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
