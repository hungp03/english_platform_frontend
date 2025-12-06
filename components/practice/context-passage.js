import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeHtml } from "@/lib/sanitize";

const ContextPassage = memo(({ contextText }) => {
  if (!contextText) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Đoạn văn</CardTitle>
      </CardHeader>
      <CardContent>
        <article
          className="prose prose-sm max-w-none ql-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(contextText) }}
        />
      </CardContent>
    </Card>
  );
});

ContextPassage.displayName = "ContextPassage";

export default ContextPassage;
