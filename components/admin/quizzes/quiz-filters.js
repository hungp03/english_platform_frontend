import { memo } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const SKILLS = ["LISTENING", "READING", "SPEAKING", "WRITING"];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bản nháp" },
  { value: "PUBLISHED", label: "Đã xuất bản" },
  { value: "ARCHIVED", label: "Đã lưu trữ" },
];

const QuizFilters = memo(function QuizFilters({
  keyword,
  setKeyword,
  quizTypeId,
  setQuizTypeId,
  status,
  setStatus,
  skill,
  setSkill,
  quizSectionId,
  setQuizSectionId,
  types,
  sections,
  onSubmit,
  onChangeSection,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border p-3 sm:p-4 space-y-3 bg-background"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm..."
            className="pl-9"
          />
        </div>

        <Select
          value={quizTypeId}
          onValueChange={(v) => {
            setQuizTypeId(v);
            setQuizSectionId("all");
          }}
        >
          <SelectTrigger className="w-full">
            <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
            <SelectValue placeholder="Loại đề" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {types.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.name || t.code || t.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={skill}
          onValueChange={(v) => {
            setSkill(v);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Kỹ năng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {SKILLS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={quizSectionId}
          onValueChange={onChangeSection}
          disabled={!quizTypeId || quizTypeId === "all" || sections.length === 0}
        >
          <SelectTrigger className="w-full xl:col-span-2">
            <SelectValue placeholder="Phần thi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {sections.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {(s.name || s.id) + (s.skill ? ` • ${s.skill}` : "")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="w-full sm:w-auto">
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Tìm kiếm</span>
        </Button>
      </div>
    </form>
  );
});

export default QuizFilters;
