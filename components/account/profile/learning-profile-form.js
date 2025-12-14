"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLearningProfile, updateLearningProfile, deleteLearningProfile } from "@/lib/api/learning-profile";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

const LEVELS = [
  { value: "BEGINNER", label: "Mới bắt đầu" },
  { value: "ELEMENTARY", label: "Sơ cấp" },
  { value: "INTERMEDIATE", label: "Trung cấp" },
  { value: "UPPER_INTERMEDIATE", label: "Trung cấp cao" },
  { value: "ADVANCED", label: "Nâng cao" },
];

const GOALS = [
  { value: "GENERAL", label: "Tiếng Anh tổng quát" },
  { value: "IELTS", label: "IELTS" },
  { value: "TOEIC", label: "TOEIC" },
  { value: "TOEFL", label: "TOEFL" },
  { value: "COMMUNICATION", label: "Giao tiếp" },
  { value: "BUSINESS", label: "Tiếng Anh thương mại" },
  { value: "ACADEMIC", label: "Học thuật" },
];

const STUDY_TIMES = [
  { value: "MORNING", label: "Buổi sáng" },
  { value: "AFTERNOON", label: "Buổi chiều" },
  { value: "EVENING", label: "Buổi tối" },
  { value: "NIGHT", label: "Đêm khuya" },
  { value: "FLEXIBLE", label: "Linh hoạt" },
];

const TIME_UNITS = [
  { value: "minutes", label: "phút" },
  { value: "hours", label: "giờ" },
];

export default function LearningProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeUnit, setTimeUnit] = useState("minutes");
  const [initialTimeUnit, setInitialTimeUnit] = useState("minutes");
  const [form, setForm] = useState({
    currentLevel: "",
    learningGoal: "",
    targetScore: "",
    dailyStudyTime: 30,
    preferredStudyTime: "",
    studyDaysPerWeek: 5,
  });
  const [initialForm, setInitialForm] = useState(null);

  useEffect(() => {
    getLearningProfile().then((res) => {
      if (res.success && res.data) {
        const minutes = res.data.dailyStudyMinutes || 30;
        const useHours = minutes >= 60 && minutes % 60 === 0;
        setTimeUnit(useHours ? "hours" : "minutes");
        setInitialTimeUnit(useHours ? "hours" : "minutes");
        const formData = {
          currentLevel: res.data.currentLevel || "",
          learningGoal: res.data.learningGoal || "",
          targetScore: res.data.targetScore || "",
          dailyStudyTime: useHours ? minutes / 60 : minutes,
          preferredStudyTime: res.data.preferredStudyTime || "",
          studyDaysPerWeek: res.data.studyDaysPerWeek || 5,
        };
        setForm(formData);
        setInitialForm(formData);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const dailyStudyMinutes = timeUnit === "hours" 
      ? form.dailyStudyTime * 60 
      : form.dailyStudyTime;
    const payload = {
      currentLevel: form.currentLevel,
      learningGoal: form.learningGoal,
      targetScore: form.targetScore ? parseInt(form.targetScore) : null,
      dailyStudyMinutes,
      preferredStudyTime: form.preferredStudyTime,
      studyDaysPerWeek: form.studyDaysPerWeek,
    };
    const res = await updateLearningProfile(payload);
    setSaving(false);
    if (res.success) {
      toast.success("Đã lưu hồ sơ học tập");
      setInitialForm(form);
      setInitialTimeUnit(timeUnit);
    } else toast.error(res.error);
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa hồ sơ học tập?")) return;
    const res = await deleteLearningProfile();
    if (res.success) {
      toast.success("Đã xóa hồ sơ học tập");
      const emptyForm = {
        currentLevel: "",
        learningGoal: "",
        targetScore: "",
        dailyStudyTime: 30,
        preferredStudyTime: "",
        studyDaysPerWeek: 5,
      };
      setForm(emptyForm);
      setInitialForm(null);
      setTimeUnit("minutes");
      setInitialTimeUnit("minutes");
    } else toast.error(res.error);
  };

  if (loading) return <div className="text-sm text-muted-foreground">Đang tải...</div>;

  const showTargetScore = ["IELTS", "TOEIC", "TOEFL"].includes(form.learningGoal);
  
  const scoreConfig = {
    IELTS: { min: 0, max: 9, step: 0.5, label: "(0-9)" },
    TOEIC: { min: 0, max: 990, step: 5, label: "(0-990)" },
    TOEFL: { min: 0, max: 120, step: 1, label: "(0-120)" },
  };
  const score = scoreConfig[form.learningGoal] || {};

  const hasChanges = !initialForm || 
    JSON.stringify({ ...form, timeUnit }) !== JSON.stringify({ ...initialForm, timeUnit: initialTimeUnit });
  const isFormValid = form.currentLevel && form.learningGoal && form.preferredStudyTime && hasChanges;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Trình độ hiện tại</Label>
        <Select value={form.currentLevel} onValueChange={(v) => setForm({ ...form, currentLevel: v })}>
          <SelectTrigger><SelectValue placeholder="Chọn trình độ" /></SelectTrigger>
          <SelectContent>
            {LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Mục tiêu học</Label>
        <Select value={form.learningGoal} onValueChange={(v) => setForm({ ...form, learningGoal: v, targetScore: "" })}>
          <SelectTrigger><SelectValue placeholder="Chọn mục tiêu" /></SelectTrigger>
          <SelectContent>
            {GOALS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {showTargetScore && (
        <div className="space-y-2">
          <Label>Điểm mục tiêu {score.label}</Label>
          <Input
            type="number"
            value={form.targetScore}
            onChange={(e) => setForm({ ...form, targetScore: e.target.value })}
            min={score.min}
            max={score.max}
            step={score.step}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Thời gian học/ngày</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={form.dailyStudyTime}
              onChange={(e) => setForm({ ...form, dailyStudyTime: parseInt(e.target.value) || 1 })}
              min={1}
              max={timeUnit === "hours" ? 8 : 480}
              className="flex-1"
            />
            <Select value={timeUnit} onValueChange={setTimeUnit}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIME_UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Số ngày học/tuần</Label>
          <Input
            type="number"
            value={form.studyDaysPerWeek}
            onChange={(e) => setForm({ ...form, studyDaysPerWeek: parseInt(e.target.value) || 5 })}
            min={1}
            max={7}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Thời điểm học ưa thích</Label>
        <Select value={form.preferredStudyTime} onValueChange={(v) => setForm({ ...form, preferredStudyTime: v })}>
          <SelectTrigger><SelectValue placeholder="Chọn thời điểm" /></SelectTrigger>
          <SelectContent>
            {STUDY_TIMES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving || !isFormValid}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu thay đổi
        </Button>
        <Button type="button" variant="outline" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa
        </Button>
      </div>
    </form>
  );
}
