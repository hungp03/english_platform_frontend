"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { listPublicQuizSectionsByType } from "@/lib/api/quiz/quiz-section";
import { listPublishedBySection } from "@/lib/api/quiz/quiz";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const SKILLS = ["LISTENING", "READING", "SPEAKING", "WRITING"];

const capitalize = (s) => s.charAt(0) + s.slice(1).toLowerCase();

const SkillButton = memo(({ skill, isActive, onClick }) => (
  <Button
    variant={isActive ? "default" : "outline"}
    onClick={onClick}
  >
    {capitalize(skill)}
  </Button>
));

SkillButton.displayName = "SkillButton";

const QuizItem = memo(({ quiz }) => (
  <Link
    href={`/practice/${quiz.id}`}
    className="block border bg-white rounded-lg p-3 hover:shadow-md transition"
  >
    <div className="font-medium">{quiz.title}</div>
    {quiz.description && (
      <div className="text-sm text-muted-foreground mt-1">
        {quiz.description}
      </div>
    )}
  </Link>
));

QuizItem.displayName = "QuizItem";

const SectionItem = memo(({ 
  section, 
  isExpanded, 
  quizzes, 
  isLoadingQuizzes, 
  onToggle 
}) => (
  <div className="border rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-4 hover:bg-muted/50 transition flex items-center justify-between text-left"
    >
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">
          {capitalize(section.skill || "")}
        </div>
        <div className="text-lg font-semibold">{section.name}</div>
        {section.description && (
          <div className="text-sm mt-1 text-muted-foreground">{section.description}</div>
        )}
      </div>
      {isExpanded ? (
        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      )}
    </button>

    {isExpanded && (
      <div className="border-t bg-muted/20 p-4">
        {isLoadingQuizzes ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-muted-foreground text-center py-4">
            Chưa có bài thi nào
          </div>
        ) : (
          <div className="grid gap-2">
            {quizzes.map((q) => (
              <QuizItem key={q.id} quiz={q} />
            ))}
          </div>
        )}
      </div>
    )}
  </div>
));

SectionItem.displayName = "SectionItem";

export default function SiteQuizTypeSectionsPage() {
  const params = useParams();
  const quizTypeId = params?.id?.toString();
  const [sections, setSections] = useState([]);
  const [activeSkill, setActiveSkill] = useState("LISTENING");
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [quizzes, setQuizzes] = useState({});
  const [loadingQuizzes, setLoadingQuizzes] = useState({});

  const load = useCallback(async (typeId, skill) => {
    if (!typeId || !skill) return;
    setLoading(true);
    try {
      const data = await listPublicQuizSectionsByType(typeId, { skill });
      const items = Array.isArray(data)
        ? data
        : data?.data || data?.result || [];
      setSections(items || []);
    } catch (e) {
      console.error("Error loading quiz sections:", e);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQuizzes = useCallback(async (sectionId) => {
    if (quizzes[sectionId]) return;
    
    setLoadingQuizzes(prev => ({ ...prev, [sectionId]: true }));
    try {
      const res = await listPublishedBySection(sectionId, { page: 1, pageSize: 100 });
      const items = res?.data?.result || [];
      setQuizzes(prev => ({ ...prev, [sectionId]: items }));
    } catch (e) {
      console.error("Error loading quizzes:", e);
      setQuizzes(prev => ({ ...prev, [sectionId]: [] }));
    } finally {
      setLoadingQuizzes(prev => ({ ...prev, [sectionId]: false }));
    }
  }, [quizzes]);

  const toggleSection = useCallback((sectionId) => {
    const isExpanded = expandedSections[sectionId];
    setExpandedSections(prev => ({ ...prev, [sectionId]: !isExpanded }));
    
    if (!isExpanded && !quizzes[sectionId]) {
      loadQuizzes(sectionId);
    }
  }, [expandedSections, quizzes, loadQuizzes]);

  const handleSkillChange = useCallback((skill) => {
    setActiveSkill(skill);
  }, []);

  useEffect(() => {
    if (quizTypeId) {
      load(quizTypeId, activeSkill);
      setExpandedSections({});
      setQuizzes({});
    }
  }, [quizTypeId, activeSkill, load]);

  const skillButtons = useMemo(() => 
    SKILLS.map((s) => (
      <SkillButton
        key={s}
        skill={s}
        isActive={activeSkill === s}
        onClick={() => handleSkillChange(s)}
      />
    )),
    [activeSkill, handleSkillChange]
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Chọn kỹ năng luyện tập</h1>
        <p className="text-muted-foreground">
          Hãy chọn kỹ năng bạn muốn rèn luyện. Mỗi kỹ năng có các bài tập được thiết kế 
          để giúp bạn cải thiện từng khía cạnh của việc học tiếng Anh.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
        {skillButtons}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-xl p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">
          Chưa có bài thi nào cho kỹ năng này
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((sec) => (
            <SectionItem
              key={sec.id}
              section={sec}
              isExpanded={expandedSections[sec.id]}
              quizzes={quizzes[sec.id] || []}
              isLoadingQuizzes={loadingQuizzes[sec.id]}
              onToggle={() => toggleSection(sec.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
