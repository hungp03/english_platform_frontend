"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { listQuizTypes } from "@/lib/api/quiz/quiz-type";

export default function QuizSectionForm({ initial = null, onSubmit, submitting = false }) {
  const [name, setName] = useState(initial?.name || "");
  const [quizTypeId, setQuizTypeId] = useState(initial?.quizTypeId ? String(initial.quizTypeId) : "none");
  const [skill, setSkill] = useState(initial?.skill || "none");
  const [types, setTypes] = useState([]);

  useEffect(() => { 
    (async () => {
      try {
        const result = await listQuizTypes();
        const typesList = result?.data || result || [];
        setTypes(Array.isArray(typesList) ? typesList : []);
      } catch (error) {
        console.error("Không thể tải danh sách loại quiz:", error);
        setTypes([]);
      }
    })(); 
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name || quizTypeId === "none" || skill === "none") {
      return;
    }
    
    onSubmit({ 
      name, 
      quizTypeId,
      skill 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initial ? "Cập nhật" : "Tạo phần luyện tập"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          {/* Ô nhập tên */}
          <div className="flex-1">
            <label className="block text-sm mb-1">Tên phần</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="ví dụ: WRITING TASK 1 - Biểu đồ cột" 
            />
          </div>
          
          {/* Chọn loại quiz - hiển thị khi đã có tên */}
          {name && (
            <div className="flex-1">
              <label className="block text-sm mb-1">Loại đề</label>
              <Select 
                value={quizTypeId} 
                onValueChange={(value) => setQuizTypeId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại đề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Chọn loại đề --</SelectItem>
                  {types.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Chọn kỹ năng - hiển thị khi đã chọn loại quiz */}
          {name && quizTypeId !== "none" && (
            <div className="flex-1">
              <label className="block text-sm mb-1">Kỹ năng</label>
              <Select 
                value={skill} 
                onValueChange={(value) => setSkill(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kỹ năng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Chọn kỹ năng --</SelectItem>
                  {[
                    { key: "LISTENING", label: "Nghe" },
                    { key: "READING", label: "Đọc" },
                    { key: "SPEAKING", label: "Nói" },
                    { key: "WRITING", label: "Viết" }
                  ].map(s => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Nút lưu - hiển thị khi đã đầy đủ thông tin */}
          {name && quizTypeId !== "none" && skill !== "none" && (
            <Button type="submit" disabled={submitting}>
              {submitting ? "Đang lưu..." : "Lưu"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
