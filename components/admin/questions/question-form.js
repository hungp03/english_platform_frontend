import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { questionCreateSchema } from "@/schema/question";

export default function QuestionForm({ quizId, quizSkill, orderIndex, onSubmit, onCancel, initialData, isEditing = false }) {
  const getDefaultValues = () => {
    if (initialData) {
      return {
        quizId: initialData.quizId || quizId,
        content: initialData.content || "",
        explanation: initialData.explanation || "",
        orderIndex: initialData.orderIndex ?? orderIndex,
        options: (initialData.options || []).map((o, idx) => ({
          content: o.content || "",
          correct: !!o.correct,
          orderIndex: o.orderIndex ?? idx + 1,
        })),
      };
    }
    return {
      quizId,
      content: "",
      explanation: "",
      orderIndex,
      ...(quizSkill !== "SPEAKING" && quizSkill !== "WRITING" && {
        options: [
          { content: "", correct: false, orderIndex: 1 },
          { content: "", correct: false, orderIndex: 2 },
          { content: "", correct: false, orderIndex: 3 },
          { content: "", correct: false, orderIndex: 4 },
        ],
      }),
    };
  };

  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(questionCreateSchema),
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const handleCorrectChange = (idx) => {
    fields.forEach((_, i) => {
      setValue(`options.${i}.correct`, i === idx);
    });
  };

  const showOptions = quizSkill !== "SPEAKING" && quizSkill !== "WRITING";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("quizId")} />
      
      {/* Nội dung câu hỏi */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Nội dung câu hỏi</label>
        <Textarea
          placeholder="Nhập nội dung câu hỏi..."
          rows={5}
          {...register("content")}
          className={errors.content ? "border-red-500" : ""}
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      {/* [MỚI] Giải thích chi tiết cho câu hỏi */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Giải thích chi tiết cho câu hỏi</label>
        <Textarea
          placeholder="Nhập giải thích cho câu hỏi này..."
          rows={3}
          {...register("explanation")}
          className={errors.explanation ? "border-red-500" : ""}
        />
        {errors.explanation && (
          <p className="text-sm text-red-500">{errors.explanation.message}</p>
        )}
      </div>

      {/* Thứ tự */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Thứ tự</label>
        <Input
          type="number"
          min="1"
          className={`w-32 ${errors.orderIndex ? "border-red-500" : ""}`}
          {...register("orderIndex", { valueAsNumber: true })}
        />
        {errors.orderIndex && (
          <p className="text-sm text-red-500">{errors.orderIndex.message}</p>
        )}
      </div>

      {showOptions && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Phương án trả lời</div>
            <Button
              type="button"
              onClick={() => append({ content: "", correct: false, orderIndex: fields.length + 1 })}
              variant="outline"
              size="sm"
            >
              + Thêm phương án
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Phương án {idx + 1}
                  </span>
                  <Button
                    type="button"
                    onClick={() => remove(idx)}
                    variant="destructive"
                    size="sm"
                  >
                    Xóa
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-medium text-gray-600">Nội dung</label>
                    <Input
                      placeholder={`Nhập phương án ${idx + 1}...`}
                      {...register(`options.${idx}.content`)}
                      className={errors.options?.[idx]?.content ? "border-red-500" : ""}
                    />
                    {errors.options?.[idx]?.content && (
                      <p className="text-xs text-red-500">{errors.options[idx].content.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600">Thứ tự</label>
                    <Input
                      type="number"
                      {...register(`options.${idx}.orderIndex`, { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`correct-${idx}`}
                    {...register(`options.${idx}.correct`)}
                    onChange={() => handleCorrectChange(idx)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`correct-${idx}`} className="text-sm font-medium">
                    Đáp án đúng
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit">{isEditing ? "Cập nhật" : "Tạo mới"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </form>
  );
}