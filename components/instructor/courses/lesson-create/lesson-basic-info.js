"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function LessonBasicInfo({ register, watch, setValue, errors }) {
    return (
        <>
            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                    Tiêu đề <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="title"
                    {...register("title")}
                    placeholder="VD: Introduction to English Sounds"
                    className="transition-all focus-visible:ring-2"
                />
                {errors.title && (
                    <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
                )}
            </div>

            {/* Kind and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Phân loại <span className="text-destructive">*</span>
                    </Label>
                    <Select value={watch("kind")} onValueChange={(val) => setValue("kind", val)}>
                        <SelectTrigger className="transition-all focus:ring-2">
                            <SelectValue placeholder="Chọn loại bài học" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="VIDEO">Video</SelectItem>
                            <SelectItem value="TEXT">Bài viết</SelectItem>
                            <SelectItem value="QUIZ">Trắc nghiệm</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.kind && (
                        <p className="text-destructive text-sm mt-1">{errors.kind.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="estimatedMin" className="text-sm font-medium">
                        Thời lượng (phút) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="estimatedMin"
                        type="number"
                        min={1}
                        {...register("estimatedMin", { valueAsNumber: true })}
                        className="transition-all focus-visible:ring-2"
                    />
                    {errors.estimatedMin && (
                        <p className="text-destructive text-sm mt-1">{errors.estimatedMin.message}</p>
                    )}
                </div>
            </div>

            {/* Position */}
            <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">
                    Thứ tự <span className="text-muted-foreground text-xs">(tùy chọn)</span>
                </Label>
                <Input
                    id="position"
                    type="number"
                    min={1}
                    {...register("position")}
                    placeholder="Vị trí của bài học trong module"
                    className="transition-all focus-visible:ring-2"
                />
                {errors.position && (
                    <p className="text-destructive text-sm mt-1">{errors.position.message}</p>
                )}
            </div>

            {/* Free Checkbox */}
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30 border border-muted">
                <Checkbox
                    id="isFree"
                    checked={watch("isFree")}
                    onCheckedChange={(checked) => setValue("isFree", checked)}
                />
                <Label
                    htmlFor="isFree"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                    Cho phép học viên xem miễn phí
                </Label>
            </div>
        </>
    )
}
