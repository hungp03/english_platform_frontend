import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getAllSkills } from "@/lib/api/skill"

export function SkillFilters({ selectedSkills, onSkillToggle, onClearAll }) {
  const [skills, setSkills] = useState([])

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await getAllSkills()
        if (res.success && res.data) {
          setSkills(res.data)
        }
      } catch (err) {
        console.error("Failed to fetch skills:", err)
      }
    }
    fetchSkills()
  }, [])

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Button
        variant={selectedSkills.length === 0 ? "default" : "outline"}
        size="sm"
        onClick={onClearAll}
      >
        Tất cả
      </Button>
      {skills.map((skill) => (
        <Button
          key={skill.id}
          variant={selectedSkills.includes(skill.name) ? "default" : "outline"}
          size="sm"
          onClick={() => onSkillToggle(skill.name)}
        >
          {skill.name}
        </Button>
      ))}
    </div>
  )
}
