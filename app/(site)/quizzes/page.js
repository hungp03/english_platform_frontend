"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { listPublicQuizTypes } from "@/lib/api/quiz/quiz-type";
import { searchPublicQuizzes } from "@/lib/api/quiz/quiz";

const SKILLS = ["", "LISTENING","READING","SPEAKING","WRITING"];

export default function SiteQuizzesPage(){
  const [keyword, setKeyword] = useState("");
  const [quizTypeId, setQuizTypeId] = useState("");
  const [skill, setSkill] = useState("");
  const [types, setTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, pages: 1, total: 0 });

  const load = useCallback(async () => {
    const data = await searchPublicQuizzes({ page, pageSize, keyword, quizTypeId: quizTypeId || null, skill: skill || null });
    setItems(data.result || []);
    setMeta(data.meta || { page, pageSize, pages: 1, total: 0 });
  }, [page, pageSize, keyword, quizTypeId, skill]);

  const handleSearch = useCallback(() => {
    setPage(1);
    load();
  }, [load]);

  useEffect(() => { (async () => setTypes(await listPublicQuizTypes()))(); }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-semibold">Tìm kiếm bài thi</h1>
        <p className="text-muted-foreground">
          Khám phá thư viện bài thi phong phú của chúng tôi. Sử dụng bộ lọc bên dưới để tìm bài thi 
          phù hợp với loại đề thi và kỹ năng bạn muốn luyện tập.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Filter</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-3">
          <Input placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <Select value={quizTypeId} onValueChange={setQuizTypeId}>
            <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {types?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={skill} onValueChange={setSkill}>
            <SelectTrigger><SelectValue placeholder="All skills" /></SelectTrigger>
            <SelectContent>
              {SKILLS.map(s => <SelectItem key={s} value={s}>{s || "All skills"}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>Search</Button>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {items.map(q => (
          <div key={q.id} className="border p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-medium">{q.title}</div>
              <div className="text-sm text-muted-foreground">Type: {q.quizTypeName}</div>
            </div>
            <Link className="text-primary" href={`/quizzes/${q.id}`}>Open</Link>
          </div>
        ))}
        {items.length === 0 && <div>No quizzes</div>}
      </div>

      {meta.pages > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.pages} onPageChange={setPage} />
      )}
    </div>
  );
}