"use client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

/** Minimal card for a quiz section */
export default function SectionCard({ section, href }) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer hover:shadow-md transition">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">{section.quizTypeName || ""} · {section.skill || section.sectionSkill || section.quizSkill}</div>
          <div className="text-lg font-semibold mt-1">{section.name}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
