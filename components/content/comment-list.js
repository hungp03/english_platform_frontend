"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/store/auth-store";
import { appCreateComment, appDeleteComment } from "@/lib/api/content/comments";

// ---- Helpers to read inconsistent backend fields safely ----
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
    c?.author?.avatar ||
    c?.authorAvatarUrl ||
    c?.author_avatar_url ||
    null
  );
}
function authorIdOf(c) {
  return c?.author?.id ?? c?.authorId ?? c?.author_id ?? null;
}
function initials(name) {
  if (!name) return "A";
  const parts = (name || "").trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || (first || "A").toUpperCase();
}

// ---- Single comment item (both level-1 and level-2) ----
function CommentItem({ c, isOwner, onDelete, children, onReplyClick, canReply }) {
  const name = displayNameOf(c);
  const avatar = avatarOf(c);
  const createdAt = c.createdAt ? new Date(c.createdAt).toLocaleString("vi-VN") : "";

  return (
    <div className="flex gap-3 py-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={avatar ?? undefined} alt={name} />
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{createdAt}</div>
          <div className="ml-auto flex items-center gap-2">
            {canReply && (
              <button
                className="text-xs underline hover:no-underline"
                onClick={onReplyClick}
              >
                Trả lời
              </button>
            )}
            {isOwner && (
              <button
                className="text-xs text-red-600 underline hover:no-underline"
                onClick={() => onDelete?.(c)}
              >
                Xóa
              </button>
            )}
          </div>
        </div>
        <div className="whitespace-pre-wrap text-sm mt-1">{c.bodyMd || c.body || ""}</div>
        {children}
      </div>
    </div>
  );
}

// ---- Inline reply form (only level-1 can be replied to) ----
function InlineReplyForm({ onSubmit, onCancel, loading }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Nội dung bình luận không được để trống");
      return;
    }
    
    onSubmit?.(body);
    setBody("");
  };

  return (
    <form className="mt-2 flex flex-col gap-2" onSubmit={handleSubmit}>
      <Textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (error) setError("");
        }}
        placeholder="Viết phản hồi..."
        rows={3}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm">
          Gửi
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading} size="sm">
          Hủy
        </Button>
      </div>
    </form>
  );
}

// ---- Main CommentList for Blog with 2-level threading ----
export default function CommentList({ postId, initial = [], onCreate }) {
  const user = useAuthStore(s => s.user);
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);

  const [items, setItems] = useState(initial || []);
  const [creatingTop, setCreatingTop] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const myId = user?.id;

  // ✅ State cho confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Cập nhật items khi initial thay đổi (từ pagination)
  useEffect(() => {
    setItems(initial || []);
  }, [initial]);

  // Group into 2 levels: top-level (no parentId) and replies (parentId refers to top-level)
  const { topLevel, childrenMap } = useMemo(() => {
    const tops = [];
    const map = {};
    for (const c of items) {
      const pid = c.parentId ?? c.parent_id ?? null;
      if (!pid) {
        tops.push(c);
      } else {
        if (!map[pid]) map[pid] = [];
        map[pid].push(c);
      }
    }
    const byTime = (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    tops.sort(byTime);
    Object.values(map).forEach(arr => arr.sort(byTime));
    return { topLevel: tops, childrenMap: map };
  }, [items]);

  // ✅ Mở dialog xác nhận xóa
  function openDeleteDialog(comment) {
    if (!comment?.id) return;
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  }

  // ✅ Xác nhận xóa từ dialog
  async function confirmDelete() {
    if (!commentToDelete?.id) return;
    
    setDeleting(true);
    try {
      const res = await appDeleteComment(commentToDelete.id);
      if (res.success) {
        setItems(prev => prev.filter(x => x.id !== commentToDelete.id));
        toast.success("Đã xóa bình luận");
        setDeleteDialogOpen(false);
        setCommentToDelete(null);
      } else {
        toast.error(res.error || "Xóa bình luận thất bại.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Xóa bình luận thất bại.");
    } finally {
      setDeleting(false);
    }
  }

  // Hủy xóa
  function cancelDelete() {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  }

  async function handleReply(parent, body) {
    if (!parent?.id) return;
    setReplyLoading(true);
    try {
      const payload = { bodyMd: body, parentId: parent.id };
      const res = await appCreateComment(postId, payload);
      if (res.success) {
        setItems(prev => [...prev, res.data]);
        setReplyingTo(null);
        toast.success("Đã gửi phản hồi");
      } else {
        toast.error(res.error || "Gửi phản hồi thất bại. Vui lòng thử lại.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Gửi phản hồi thất bại. Vui lòng thử lại.");
    } finally {
      setReplyLoading(false);
    }
  }

  async function handleCreateTop(e, body, setBody) {
    e.preventDefault();
    if (!body.trim()) return;
    setCreatingTop(true);
    try {
      if (onCreate) {
        const created = await onCreate({ bodyMd: body });
        if (created) setItems(prev => [...prev, created]);
        setBody("");
      } else {
        const res = await appCreateComment(postId, { bodyMd: body });
        if (res.success) {
          setItems(prev => [...prev, res.data]);
          setBody("");
          toast.success("Đã gửi bình luận");
        } else {
          toast.error(res.error || "Gửi bình luận thất bại");
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Gửi bình luận thất bại");
    } finally {
      setCreatingTop(false);
    }
  }

  return (
    <>
      <div className="space-y-2">
        {/* Existing comments */}
        {topLevel.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          topLevel.map((c) => {
            const isOwner = myId && authorIdOf(c) && String(authorIdOf(c)) === String(myId);
            const replies = childrenMap[c.id] || [];
            const canReply = isLoggedIn;
            return (
              <div key={c.id || Math.random()} className="border-b pb-3 last:border-b-0">
                <CommentItem
                  c={c}
                  isOwner={!!isOwner}
                  onDelete={openDeleteDialog}
                  canReply={canReply}
                  onReplyClick={() => setReplyingTo(c)}
                >
                  {/* Level-2 list */}
                  {replies.length > 0 && (
                    <div className="mt-2 ml-8 space-y-2">
                      {replies.map((r) => {
                        const rOwner = myId && authorIdOf(r) && String(authorIdOf(r)) === String(myId);
                        return (
                          <CommentItem
                            key={r.id || Math.random()}
                            c={r}
                            isOwner={!!rOwner}
                            onDelete={openDeleteDialog}
                            canReply={false}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Inline reply form (only for level-1) */}
                  {replyingTo?.id === c.id && (
                    <div className="mt-2 ml-8">
                      <InlineReplyForm
                        loading={replyLoading}
                        onCancel={() => setReplyingTo(null)}
                        onSubmit={(body) => handleReply(c, body)}
                      />
                    </div>
                  )}
                </CommentItem>
              </div>
            );
          })
        )}

        {/* Top-level create form */}
        {isLoggedIn ? (
          <TopLevelCreateForm onSubmit={handleCreateTop} creating={creatingTop} />
        ) : (
          <LoginPrompt />
        )}
      </div>

      {/* ✅ Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bình luận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={deleting}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Extracted top-level create form for clarity
function TopLevelCreateForm({ onSubmit, creating }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Nội dung bình luận không được để trống");
      return;
    }
    
    onSubmit(e, body, setBody);
  };

  return (
    <form className="mt-4 flex flex-col gap-2" onSubmit={handleSubmit}>
      <Textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (error) setError("");
        }}
        placeholder="Viết bình luận của bạn..."
        rows={3}
        className="resize-none"
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={creating || !body.trim()}>
          {creating ? "Đang gửi..." : "Gửi bình luận"}
        </Button>
      </div>
    </form>
  );
}

// Login prompt component
function LoginPrompt() {
  return (
    <div className="text-sm text-muted-foreground text-center py-6 border rounded-lg bg-muted/30">
      <p className="mb-3">Bạn cần đăng nhập để bình luận.</p>
      <Button
        asChild
        variant="default"
        size="sm"
      >
        <Link href="/login">Đăng nhập</Link>
      </Button>
    </div>
  );
}