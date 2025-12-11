"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { getAllSkills } from "@/lib/api/skill"
import { toast } from "sonner"

export default function SkillFocusSection({
  selectedSkills,
  toggleSkill,
  removeSkill,
  register,
  errors,
}) {
  const [availableSkills, setAvailableSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await getAllSkills()
        if (res.success && res.data) {
          setAvailableSkills(res.data)
        } else {
          toast.error("Không thể tải danh sách kỹ năng")
        }
      } catch (err) {
        console.error(err)
        toast.error("Lỗi khi tải danh sách kỹ năng")
      } finally {
        setLoading(false)
      }
    }

    fetchSkills()
  }, [])

  if (loading) {
    return (
      <div>
        <Label>Kỹ năng trọng tâm</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-3 py-1 rounded-full border bg-muted animate-pulse h-8 w-20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Label>Kỹ năng trọng tâm</Label>

      {/* Chọn từ danh sách có sẵn */}
      <div className="flex flex-wrap gap-2 mt-2">
        {availableSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill.name)
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => toggleSkill(skill.name)}
              className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                isSelected
                  ? "bg-primary text-white border-primary"
                  : "bg-background border-muted hover:bg-muted"
              }`}
              aria-pressed={isSelected}
              aria-label={`Toggle ${skill.name}`}
            >
              {skill.name}
            </button>
          )
        })}
      </div>

      {/* Hiển thị skill đã chọn */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedSkills.map((skillName) => (
            <span
              key={skillName}
              className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
            >
              {skillName}
              <X
                className="ml-1 w-3 h-3 cursor-pointer hover:text-red-500"
                onClick={() => removeSkill(skillName)}
                aria-label={`Remove ${skillName}`}
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
