"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { appReplyThread } from "@/lib/api/forum/forum";

export default function ReplyForm({ threadId, onDone }) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!body.trim()) return;
    setLoading(true);
    try {
      const userId = typeof window !== "undefined" ? localStorage.getItem("x-user-id") : undefined;
      await appReplyThread(threadId, { bodyMd: body }, { userId });
      setBody("");
      onDone?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Textarea rows={4} placeholder="Viết phản hồi..." value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="flex justify-end">
        <Button onClick={submit} disabled={loading}>{loading ? "Đang gửi..." : "Gửi phản hồi"}</Button>
      </div>
    </div>
  );
}
