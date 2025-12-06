import { memo } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

const QuestionContent = memo(function QuestionContent({ content }) {
  return (
    <article
      className="prose prose-sm max-w-none ql-content"
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(content || ""),
      }}
    />
  );
});

export default QuestionContent;
