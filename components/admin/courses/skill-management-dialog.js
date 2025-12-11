"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Trash2, Plus, Check, X } from "lucide-react"
import { toast } from "sonner"
import { getAllSkills, createSkill, updateSkill, deleteSkill } from "@/lib/api/skill"

export default function SkillManagementDialog({ open, onOpenChange, skills, onSkillsChange }) {
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState("")
  const [newSkillName, setNewSkillName] = useState("")
  const [adding, setAdding] = useState(false)

  const fetchSkills = async () => {
    setLoading(true)
    try {
      const res = await getAllSkills()
      if (res.success) {
        onSkillsChange(res.data || [])
      } else {
        toast.error("Không thể tải danh sách kỹ năng")
      }
    } catch (err) {
      toast.error("Lỗi khi tải danh sách kỹ năng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && skills.length === 0) {
      fetchSkills()
    }
  }, [open, skills.length])

  const handleCreate = async () => {
    if (!newSkillName.trim()) return
    
    const tempId = `temp-${Date.now()}`
    const tempSkill = { id: tempId, name: newSkillName.trim() }
    
    // Optimistic update
    onSkillsChange([...skills, tempSkill])
    setNewSkillName("")
    setAdding(true)
    
    try {
      const res = await createSkill(newSkillName.trim())
      if (res.success) {
        // Replace temp skill with real one
        onSkillsChange(prev => prev.map(s => s.id === tempId ? res.data : s))
        toast.success("Tạo kỹ năng thành công")
      } else {
        // Revert on error
        onSkillsChange(prev => prev.filter(s => s.id !== tempId))
        toast.error(res.error)
      }
    } catch (err) {
      // Revert on error
      onSkillsChange(prev => prev.filter(s => s.id !== tempId))
      toast.error("Lỗi khi tạo kỹ năng")
    } finally {
      setAdding(false)
    }
  }

  const handleUpdate = async (id) => {
    if (!editingName.trim()) return
    
    const oldName = skills.find(s => s.id === id)?.name
    
    // Optimistic update
    onSkillsChange(prev => prev.map(s => s.id === id ? { ...s, name: editingName.trim() } : s))
    setEditingId(null)
    setEditingName("")
    
    try {
      const res = await updateSkill(id, editingName.trim())
      if (res.success) {
        toast.success("Cập nhật kỹ năng thành công")
      } else {
        // Revert on error
        onSkillsChange(prev => prev.map(s => s.id === id ? { ...s, name: oldName } : s))
        toast.error(res.error)
      }
    } catch (err) {
      // Revert on error
      onSkillsChange(prev => prev.map(s => s.id === id ? { ...s, name: oldName } : s))
      toast.error("Lỗi khi cập nhật kỹ năng")
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Bạn có chắc muốn xóa kỹ năng "${name}"?`)) return
    
    // Optimistic update
    const deletedSkill = skills.find(s => s.id === id)
    onSkillsChange(prev => prev.filter(s => s.id !== id))
    
    try {
      const res = await deleteSkill(id)
      if (res.success) {
        toast.success("Xóa kỹ năng thành công")
      } else {
        // Revert on error
        onSkillsChange(prev => [...prev, deletedSkill])
        toast.error(res.error)
      }
    } catch (err) {
      // Revert on error
      onSkillsChange(prev => [...prev, deletedSkill])
      toast.error("Lỗi khi xóa kỹ năng")
    }
  }

  const startEdit = (skill) => {
    setEditingId(skill.id)
    setEditingName(skill.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quản lý kỹ năng</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new skill */}
          <div className="space-y-2">
            <Label htmlFor="newSkill">Thêm kỹ năng mới</Label>
            <div className="flex gap-2">
              <Input
                id="newSkill"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Tên kỹ năng..."
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="flex-1"
              />
              <Button 
                onClick={handleCreate} 
                disabled={!newSkillName.trim() || adding}
              >
                <Plus className="h-4 w-4 mr-2" />
                {adding ? "Đang thêm..." : "Thêm"}
              </Button>
            </div>
          </div>

          {/* Skills table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên kỹ năng</TableHead>
                  <TableHead className="w-32">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : skills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8">
                      Chưa có kỹ năng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  skills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell>
                        {editingId === skill.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdate(skill.id)
                              if (e.key === "Escape") cancelEdit()
                            }}
                            autoFocus
                          />
                        ) : (
                          skill.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === skill.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdate(skill.id)}
                              disabled={!editingName.trim()}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(skill)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(skill.id, skill.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
