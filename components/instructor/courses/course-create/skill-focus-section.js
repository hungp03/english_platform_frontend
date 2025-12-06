"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

const SKILL_OPTIONS = ["Listening", "Reading", "Writing", "Speaking", "Grammar", "Vocabulary"]

export default function SkillFocusSection({
  selectedSkills,
  customSkills,
  customInput,
  customInputRef,
  setCustomInput,
  toggleSkill,
  addCustomSkill,
  handleCustomKeyDown,
  removeSkill,
  toKey,
  register,
  errors,
}) {
  const allSkills = [...selectedSkills, ...customSkills]

  return (
    <div>
      <Label>Kỹ năng trọng tâm</Label>

      {/* Chọn từ danh sách có sẵn */}
      <div className="flex flex-wrap gap-2 mt-2">
        {SKILL_OPTIONS.map((skill) => {
          const isSelected = selectedSkills.includes(skill)
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                isSelected
                  ? "bg-primary text-white border-primary"
                  : "bg-background border-muted hover:bg-muted"
              }`}
              aria-pressed={isSelected}
              aria-label={`Toggle ${skill}`}
            >
              {skill}
            </button>
          )
        })}
      </div>

      {/* Ô thêm custom skill */}
      <div className="flex gap-2 mt-3">
        <Input
          ref={customInputRef}
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleCustomKeyDown}
          placeholder="Thêm kỹ năng khác..."
          aria-label="Thêm kỹ năng khác"
        />
        <Button type="button" variant="secondary" onClick={addCustomSkill}>
          Thêm
        </Button>
      </div>

      {/* Hiển thị tất cả skill đã chọn/nhập */}
      {allSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {allSkills.map((skill) => (
            <span
              key={`${skill}-${toKey(skill)}`}
              className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
            >
              {skill}
              <X
                className="ml-1 w-3 h-3 cursor-pointer hover:text-red-500"
                onClick={() => removeSkill(skill)}
                aria-label={`Remove ${skill}`}
              />
            </span>
          ))}
        </div>
      )}

      {/* field ẩn để RHF hiểu có field skillFocus (mảng) */}
      <input type="hidden" {...register("skillFocus")} />

      {errors.skillFocus && (
        <p className="text-red-500 text-sm mt-1">{errors.skillFocus.message}</p>
      )}
    </div>
  )
}
