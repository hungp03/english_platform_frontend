"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import SaveThreadButton from "@/components/forum/save-thread-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { getForumThreadBySlug, getThreadPosts, reportPost, reportThread, lockThread, unlockThread, deleteOwnPost } from "@/lib/api/forum";
import { Pagination } from "@/components/ui/pagination";
import ReplyForm from "@/components/forum/reply-form";
import ReplyToPostForm from "@/components/forum/reply-to-post-form";
import ReportDialog from "@/components/forum/report-dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0 });
  const [page, setPage] = useState(1); 
  const [replyingPostId, setReplyingPostId] = useState(null);
  const [loadingThread, setLoadingThread] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const pageSize = 20;

  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const hydrateFromMe = useAuthStore((s) => s.hydrateFromMe);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  
  useEffect(() => {
    (hydrateFromMe || fetchMe)?.();
  }, [hydrateFromMe, fetchMe]);

  const eqIds = useCallback((a, b) => (a && b ? String(a) === String(b) : false), []);
  const isOwnerThread = useMemo(() => 
    thread ? eqIds(user?.id, thread.authorId) : false,
    [thread, user?.id, eqIds]
  );

  const load = useCallback(async () => {
    if (!slug) return;
    setLoadingThread(true);
    const result = await getForumThreadBySlug(slug);
    if (result.success) {
      setThread(result.data);
    } else {
      toast.error(result.error || "Không thể tải thông tin chủ đề");
      setThread(null);
    }
    setLoadingThread(false);
  }, [slug]);

  const loadPosts = useCallback(async (p = page) => {
    if (!thread?.id) return;
    setLoadingPosts(true);
    const result = await getThreadPosts(thread.id, { page: p, pageSize });
    if (result.success) {
      const data = result.data;
      setPosts(data?.content || data?.result || []);
      setMeta(data?.meta || { page: p, pages: data?.totalPages || 0 });
    } else {
      toast.error(result.error || "Không thể tải danh sách bài viết");
      setPosts([]);
      setMeta({ page: p, pages: 0 });
    }
    setLoadingPosts(false);
  }, [thread?.id, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [thread?.id]); 
  useEffect(() => { if (thread?.id) loadPosts(page); }, [loadPosts, page, thread?.id]);

  const openDeleteDialog = useCallback((postId) => {
    if (!postId) return;
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!postToDelete) return;

    const previousPosts = [...posts];
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postToDelete));
    setDeleting(true);

    try {
      const result = await deleteOwnPost(postToDelete);
      if (result.success) {
        toast.success("Đã xóa phản hồi");
        setDeleteDialogOpen(false);
        setPostToDelete(null);
      } else {
        setPosts(previousPosts);
        toast.error(result.error || "Không thể xóa phản hồi");
      }
    } catch (error) {
      setPosts(previousPosts);
      toast.error("Không thể xóa phản hồi. Vui lòng thử lại.");
      console.error("Error deleting post:", error);
    } finally {
      setDeleting(false);
    }
  }, [postToDelete, posts]);

  const cancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  }, []);

  const openReportDialog = useCallback((target) => {
    setReportTarget(target);
    setReportOpen(true);
  }, []);

  const handleReportSubmit = useCallback(async (reason) => {
    if (!reportTarget?.id) return;
    setReportLoading(true);
    try {
      const result = reportTarget.type === "post" 
        ? await reportPost(reportTarget.id, reason)
        : await reportThread(reportTarget.id, reason);
      
      if (result.success) {
        setReportOpen(false);
        toast.success("Đã gửi báo cáo. Cảm ơn bạn!");
      } else {
        toast.error(result.error || "Gửi báo cáo thất bại");
      }
    } catch (e) {
      console.error(e);
      toast.error("Gửi báo cáo thất bại. Vui lòng thử lại.");
    } finally {
      setReportLoading(false);
    }
  }, [reportTarget]);

  const handleReplyDone = useCallback(async () => {
    if (!thread?.id) return;
    
    const result = await getThreadPosts(thread.id, { 
      page: 1, 
      pageSize 
    });
    
    if (result.success) {
      const data = result.data;
      const lastPage = data?.meta?.pages || data?.totalPages || 1;
      setPage(lastPage);
      await loadPosts(lastPage);
    }
  }, [thread?.id, loadPosts]);

  const handleReplyToPostDone = useCallback(async () => {
    setReplyingPostId(null);
    await loadPosts(page);
  }, [page, loadPosts]);

  const handleLockThread = useCallback(async () => {
    const result = await lockThread(thread.id);
    if (result.success) {
      toast.success("Đã khóa bình luận");
      await load();
    } else {
      toast.error(result.error || "Không thể khóa bình luận");
    }
  }, [thread?.id, load]);

  const handleUnlockThread = useCallback(async () => {
    const result = await unlockThread(thread.id);
    if (result.success) {
      toast.success("Đã mở bình luận");
      await load();
    } else {
      toast.error(result.error || "Không thể mở bình luận");
    }
  }, [thread?.id, load]);

  const handleBack = useCallback(() => {
    router.push("/forum");
  }, [router]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const toggleReply = useCallback((postId) => {
    setReplyingPostId(prev => prev === postId ? null : postId);
  }, []);

  const postsTree = useMemo(() => {
    const byParent = new Map();
    (posts || []).forEach(p => {
      const key = p.parentId ? String(p.parentId) : null;
      const arr = byParent.get(key) || [];
      arr.push(p);
      byParent.set(key, arr);
    });
    return byParent;
  }, [posts]);

  return (
    <>
      <div className="container mx-auto p-4 space-y-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {loadingThread ? (
          <Card>
            <CardHeader>
              <div className="mt-1 flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-3/4" />
              <div className="mt-2 flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ) : thread ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                {thread.title}
              </CardTitle>

              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <UserAvatar
                  src={thread.authorAvatarUrl}
                  name={thread.authorName}
                  className="w-6 h-6"
                />
                <span>{thread.authorName || "Ẩn danh"}</span>
                <span>•</span>
                <span>
                  {thread.createdAt
                    ? new Date(thread.createdAt).toLocaleString("vi-VN")
                    : ""}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {thread.categories?.map((c, idx) => (
                  <span key={idx}>
                    {c.name}
                    {idx < thread.categories.length - 1 && ", "}
                  </span>
                ))}
                {thread.categories?.length > 0 && <span>•</span>}
                <span className={thread.locked ? "text-destructive" : ""}>
                  {thread.locked ? "Đã khóa" : "Đang mở"}
                </span>

                {(!isOwnerThread) && (
                  <>
                    <span>•</span>
                    <button
                      className="underline hover:no-underline"
                      onClick={() => openReportDialog({ type: "thread", id: thread.id })}
                    >
                      Báo cáo
                    </button>
                  </>
                )}

                {isOwnerThread && (
                  <>
                    <span>•</span>
                    {!thread.locked ? (
                      <button
                        className="underline hover:no-underline"
                        onClick={handleLockThread}
                      >
                        Khóa bình luận
                      </button>
                    ) : (
                      <button
                        className="underline hover:no-underline"
                        onClick={handleUnlockThread}
                      >
                        Mở bình luận
                      </button>
                    )}
                  </>
                )}
                <div className="ml-auto">
                    <SaveThreadButton threadId={thread.id} initialIsSaved={thread.isSaved} />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <article
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: thread.bodyMd }}
              />
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Phản hồi</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {loadingPosts ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-3">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {(() => {
                  const roots = postsTree.get(null) || [];

                  if (roots.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Chưa có phản hồi nào. Hãy là người đầu tiên trả lời!</p>
                      </div>
                    );
                  }

                  return roots.map((p) => {
                    const children = postsTree.get(String(p.id)) || [];
                    return (
                      <div key={p.id} className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <UserAvatar
                              src={p.authorAvatarUrl}
                              name={p.authorName}
                              className="w-5 h-5"
                            />
                            <span>{p.authorName || "Ẩn danh"}</span>
                            <span>•</span>
                            <span>{p.createdAt ? new Date(p.createdAt).toLocaleString("vi-VN") : ""}</span>
                          </div>

                          {eqIds(user?.id, p.authorId) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="hover:bg-muted rounded p-1">
                                <MoreVertical className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => openDeleteDialog(p.id)}
                                >
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        <div className="whitespace-pre-wrap">{p.bodyMd}</div>

                        <div className="mt-2 flex flex-wrap gap-3 items-center text-xs">
                          {!eqIds(user?.id, p.authorId) && (
                            <button
                              onClick={() => openReportDialog({ type: "post", id: p.id })}
                              className="text-destructive hover:underline"
                            >
                              Báo cáo
                            </button>
                          )}

                          {!thread?.locked && isLoggedIn && (
                            <button
                              className="hover:underline"
                              onClick={() => toggleReply(p.id)}
                            >
                              {replyingPostId === p.id ? "Đóng" : "Trả lời"}
                            </button>
                          )}
                        </div>

                        {!thread?.locked && replyingPostId === p.id && (
                          <div className="mt-3">
                            <ReplyToPostForm
                              threadId={thread.id}
                              parentPostId={p.id}
                              onDone={handleReplyToPostDone}
                            />
                          </div>
                        )}

                        {children?.length > 0 && (
                          <div className="mt-3 ml-6 space-y-3">
                            {children.map((c) => (
                              <div key={c.id} className="border-l-2 border-muted pl-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <UserAvatar
                                      src={c.authorAvatarUrl}
                                      name={c.authorName}
                                      className="w-4 h-4"
                                    />
                                    <span>{c.authorName || "Ẩn danh"}</span>
                                    <span>•</span>
                                    <span>{c.createdAt ? new Date(c.createdAt).toLocaleString("vi-VN") : ""}</span>
                                  </div>

                                  {eqIds(user?.id, c.authorId) && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger className="hover:bg-muted rounded p-1">
                                        <MoreVertical className="h-3 w-3" />
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive"
                                          onClick={() => openDeleteDialog(c.id)}
                                        >
                                          Xóa
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>

                                <div className="whitespace-pre-wrap">{c.bodyMd}</div>

                                <div className="mt-2 flex flex-wrap gap-3 items-center text-xs">
                                  {!eqIds(user?.id, c.authorId) && (
                                    <button
                                      onClick={() => openReportDialog({ type: "post", id: c.id })}
                                      className="text-destructive hover:underline"
                                    >
                                      Báo cáo
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}

                {meta?.pages > 1 && (
                  <div className="mt-4">
                    <Pagination currentPage={page} totalPages={meta?.pages ?? 0} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {!thread?.locked && thread?.id && (
          <Card>
            <CardHeader>
              <CardTitle>Trả lời</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoggedIn ? (
                <ReplyForm threadId={thread.id} onDone={handleReplyDone} />
              ) : (
                <div className="text-sm text-muted-foreground text-center py-6 border rounded-lg bg-muted/30">
                  <p className="mb-3">Bạn cần đăng nhập để trả lời.</p>
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                  >
                    <Link href="/login">Đăng nhập</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <ReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          target={reportTarget}
          loading={reportLoading}
          onSubmit={handleReportSubmit}
        />
      </div>

      {/* ✅ Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phản hồi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phản hồi này không? Hành động này không thể hoàn tác.
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