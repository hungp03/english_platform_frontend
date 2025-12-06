import { Button } from "@/components/ui/button"

const SKILL_OPTIONS = [
  "Listening",
  "Speaking",
  "Reading",
  "Writing",
  "Grammar",
  "Vocabulary",
]

export function SkillFilters({ selectedSkills, onSkillToggle, onClearAll }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Button
        variant={selectedSkills.length === 0 ? "default" : "outline"}
        size="sm"
        onClick={onClearAll}
      >
        Tất cả
      </Button>
      {SKILL_OPTIONS.map((skill) => (
        <Button
          key={skill}
          variant={selectedSkills.includes(skill) ? "default" : "outline"}
          size="sm"
          onClick={() => onSkillToggle(skill)}
        >
          {skill}
        </Button>
      ))}
    </div>
  )
}
