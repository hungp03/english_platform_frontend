"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Lấy tên & avatar từ nhiều kiểu field khác nhau để khớp mọi payload backend
function displayNameOf(c) {
  return (
    c?.author?.fullName ||
    c?.author?.name ||
    c?.authorName ||
    c?.author_username ||
    "Ẩn danh"
  );
}
function avatarOf(c) {
  return (
    c?.author?.avatarUrl ||
    c?.authorAvatarUrl ||
    c?.author?.avatar ||
    c?.avatarUrl ||
    null
  );
}
function initials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b || a).toUpperCase();
}

export default function CommentList({ postId, initial, onCreate }) {
  const [body, setBody] = useState("");

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {initial?.map((c) => {
          const name = displayNameOf(c);
          const avatar = avatarOf(c);
          return (
            <div key={c.id} className="rounded-md border p-3">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatar ?? undefined} alt={name} />
                  <AvatarFallback>{initials(name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="text-sm font-medium">{name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                  </div>
                </div>
              </div>
              <div className="whitespace-pre-wrap text-sm">{c.bodyMd}</div>
            </div>
          );
        })}
      </div>

      {onCreate && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            onCreate({ bodyMd: body });
            setBody("");
          }}
        >
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Viết bình luận..."
          />
          <Button type="submit">Gửi bình luận</Button>
        </form>
      )}
    </div>
  );
}
