"use client"

import { useState } from "react"
import { BookOpen, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import SkillManagementDialog from "./skill-management-dialog"

export default function CoursesHeader({ skills, onSkillsChange }) {
  const [skillDialogOpen, setSkillDialogOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý khóa học</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý và phê duyệt các khóa học trong hệ thống
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setSkillDialogOpen(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Quản lý kỹ năng
        </Button>
      </div>

      <SkillManagementDialog 
        open={skillDialogOpen} 
        onOpenChange={setSkillDialogOpen}
        skills={skills}
        onSkillsChange={onSkillsChange}
      />
    </>
  )
}