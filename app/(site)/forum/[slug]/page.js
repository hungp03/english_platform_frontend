"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { forumGetThreadBySlug, forumListThreadPosts } from "@/lib/api/forum/forum";
import { Pagination } from "@/components/ui/pagination";
import ReplyForm from "@/components/forum/reply-form";
import ReportDialog from "@/components/forum/report-dialog";
import {
  appReportPost,
  appReportThread,
  appLockThread,
  appUnlockThread,
  appDeleteOwnPost,
} from "@/lib/api/forum/forum";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export default function ThreadDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0 });
  const [page, setPage] = useState(0);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // {type:"post"|"thread", id:string}
  const [reportLoading, setReportLoading] = useState(false);

  const pageSize = 20;

  // ===== Auth store =====
  const user = useAuthStore((s) => s.user);
  const hydrateFromMe = useAuthStore((s) => s.hydrateFromMe);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  useEffect(() => {
    (hydrateFromMe || fetchMe)?.(); // nếu store có sẵn, hydrate user một lần
  }, [hydrateFromMe, fetchMe]);

  // So sánh ID an toàn
  const eqIds = (a, b) => (a && b ? String(a) === String(b) : false);
  const isOwnerThread = thread ? eqIds(user?.id, thread.authorId) : false;

  async function load() {
    if (!slug) return;
    const t = await forumGetThreadBySlug(slug);
    setThread(t);
  }
  async function loadPosts(p = page) {
    if (!thread?.id) return;
    const { items, meta } = await forumListThreadPosts(thread.id, { page: p + 1, pageSize });
    setPosts(items || []);
    setMeta(meta || { page: p + 1, pages: 0 });
  }

  useEffect(() => { load(); }, [slug]);
  useEffect(() => { setPage(0); }, [thread?.id]);
  useEffect(() => { loadPosts(page); }, [page, thread?.id]);

  function openReportDialog(target) {
    setReportTarget(target);
    setReportOpen(true);
  }
  async function handleReportSubmit(reason) {
    if (!reportTarget?.id) return;
    setReportLoading(true);
    try {
      if (reportTarget.type === "post") await appReportPost(reportTarget.id, { reason });
      else await appReportThread(reportTarget.id, { reason });
      setReportOpen(false);
      toast.success("Đã gửi báo cáo. Cảm ơn bạn!");
    } catch (e) {
      console.error(e);
      toast.error("Gửi báo cáo thất bại. Vui lòng thử lại.");
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {thread && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{thread.title}</CardTitle>

            {/* Tác giả */}
            <div className="mt-2 flex items-center gap-2">
              <img src={thread.authorAvatarUrl || "/avatar.svg"} alt="" className="w-7 h-7 rounded-full object-cover" />
              <div className="text-xs text-muted-foreground">
                {thread.authorName || "Ẩn danh"} • {thread.createdAt ? new Date(thread.createdAt).toLocaleString() : ""}
              </div>
            </div>

            {/* Trạng thái + hành động */}
            <div className="text-xs text-muted-foreground">
              {thread.categories?.map(c => c.name).join(", ") || "Chưa phân loại"} • {thread.locked ? "Đã khóa" : "Đang mở"}

              {/* Báo cáo thread: chỉ hiển thị khi KHÔNG phải chủ bài */}
              {(!isOwnerThread) && (
                <button
                  className="ml-2 text-xs underline"
                  onClick={() => openReportDialog({ type: "thread", id: thread.id })}
                >
                  Báo cáo
                </button>
              )}

              {/* Khóa/Mở bình luận: chỉ dành cho chủ bài */}
              {isOwnerThread && (
                <div className="mt-2 flex gap-2">
                  {!thread.locked ? (
                    <button
                      className="text-xs px-2 py-1 border rounded"
                      onClick={async () => { await appLockThread(thread.id); toast.success("Đã khóa bình luận"); await load(); }}
                    >
                      Khóa bình luận
                    </button>
                  ) : (
                    <button
                      className="text-xs px-2 py-1 border rounded"
                      onClick={async () => { await appUnlockThread(thread.id); toast.success("Đã mở bình luận"); await load(); }}
                    >
                      Mở bình luận
                    </button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: thread.bodyMd }} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Phản hồi</CardTitle>
          <Pagination currentPage={page} totalPages={meta?.pages ?? 0} onPageChange={setPage} />
        </CardHeader>

        <CardContent className="grid gap-3">
          {posts.map((p) => (
            <div key={p.id} className="border rounded-md p-3">
              <div className="text-xs text-muted-foreground mb-1">
                <span className="inline-flex items-center gap-2">
                  <img src={p.authorAvatarUrl || "/avatar.svg"} className="w-5 h-5 rounded-full object-cover" alt=""/>
                  {p.authorName || "Ẩn danh"}
                </span>
                {" • "}
                {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
              </div>

              <div className="whitespace-pre-wrap">{p.bodyMd}</div>

              <div className="mt-2">
                {/* Xóa phản hồi: chỉ chủ comment */}
                {eqIds(user?.id, p.authorId) && (
                  <button
                    className="text-xs mr-3 hover:underline"
                    onClick={async () => {
                      if (!confirm("Xóa phản hồi này?")) return;
                      await appDeleteOwnPost(p.id);
                      toast.success("Đã xóa phản hồi");
                      await loadPosts(0);
                    }}
                  >
                    Xóa
                  </button>
                )}

                {/* Báo cáo comment: KHÔNG hiển thị nếu là chủ comment */}
                {!eqIds(user?.id, p.authorId) && (
                  <button
                    onClick={() => openReportDialog({ type: "post", id: p.id })}
                    className="text-xs text-destructive hover:underline"
                  >
                    Báo cáo
                  </button>
                )}
              </div>
            </div>
          ))}
          {posts.length === 0 && <div className="text-sm text-muted-foreground">Chưa có phản hồi.</div>}
        </CardContent>
      </Card>

      {/* Report dialog (thread/post) */}
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        target={reportTarget}
        loading={reportLoading}
        onSubmit={handleReportSubmit}
      />

      {/* Form trả lời: ẩn khi thread đã khóa */}
      {!thread?.locked && thread?.id && (
        <Card>
          <CardHeader><CardTitle>Trả lời</CardTitle></CardHeader>
          <CardContent>
            <ReplyForm threadId={thread.id} onDone={() => loadPosts(0)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
