"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { publicGetPostBySlug } from "@/lib/api/content/posts";
import {
  publicListCommentsByPostPaged,
  appCreateComment,
} from "@/lib/api/content/comments";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { UserAvatar } from "@/components/ui/user-avatar";
import CommentList from "@/components/content/comment-list";
import { sanitizeHtml } from "@/lib/sanitize";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    page: 1,
    pages: 1,
    total: 0,
    pageSize: 10
  });

  const loadComments = useCallback(async (postId, currentPage) => {
    setCommentsLoading(true);
    try {
      const res = await publicListCommentsByPostPaged(postId, {
        page: currentPage,
        size: 10,
      });
      
      if (res.success) {
        const { items, meta: m } = res.data;
        
        setComments(items || []);
        setMeta({
          page: m?.page || currentPage,
          pages: m?.pages || m?.totalPages || 1,
          total: m?.total || m?.totalItems || 0,
          pageSize: m?.pageSize || 10
        });
      } else {
        toast.error(res.error || "Không thể tải bình luận");
        setComments([]);
        setMeta({ page: 1, pages: 1, total: 0, pageSize: 10 });
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Không thể tải bình luận");
      setComments([]);
      setMeta({ page: 1, pages: 1, total: 0, pageSize: 10 });
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const handleCreateComment = useCallback(async (payload) => {
    try {
      const res = await appCreateComment(post.id, payload);
      
      if (!res.success) {
        toast.error(res.error || "Gửi bình luận thất bại. Vui lòng thử lại.");
        throw new Error(res.error);
      }
      
      const reloadRes = await publicListCommentsByPostPaged(post.id, {
        page: 1,
        size: 10,
      });
      
      if (reloadRes.success) {
        const totalPages = reloadRes.data?.meta?.pages || reloadRes.data?.meta?.totalPages || 1;
        setPage(totalPages);
        await loadComments(post.id, totalPages);
      }
      
      toast.success("Bình luận đã được gửi thành công!");
      
      return res.data;
    } catch (error) {
      console.error("Error creating comment:", error);
      if (!error.message?.includes("thất bại")) {
        toast.error("Gửi bình luận thất bại. Vui lòng thử lại.");
      }
      throw error;
    }
  }, [post?.id, loadComments]);

  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      await loadComments(post.id, page);
      toast.success("Đã xóa bình luận");
    } catch (error) {
      console.error("Error reloading comments after delete:", error);
    }
  }, [post?.id, page, loadComments]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > meta.pages || newPage === page) return;
    setPage(newPage);
  }, [page, meta.pages]);

  const handleBack = useCallback(() => {
    router.push("/blog");
  }, [router]);

  const sanitizedHtml = useMemo(() => {
    if (!post) return "";
    return sanitizeHtml(post.bodyMd || post.bodyHtml || post.body || "");
  }, [post]);

  const authorInfo = useMemo(() => {
    if (!post) return null;
    return {
      avatarUrl: post.authorAvatarUrl,
      name: post.authorName || "Ẩn danh",
      createdAt: post.createdAt 
        ? new Date(post.createdAt).toLocaleString("vi-VN") 
        : ""
    };
  }, [post]);

  useEffect(() => {
    async function init() {
      if (!slug) return;
      
      setIsLoading(true);
      try {
        const res = await publicGetPostBySlug(slug);
        if (res.success) {
          setPost(res.data);
          
          if (res.data?.id) {
            setPage(1);
            await loadComments(res.data.id, 1);
          }
        } else {
          toast.error(res.error || "Không thể tải bài viết");
        }
      } catch (error) {
        console.error("Error loading post:", error);
        toast.error("Không thể tải bài viết");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [slug, loadComments]);

  useEffect(() => {
    if (post?.id && page >= 1) {
      loadComments(post.id, page);
    }
  }, [page, post?.id, loadComments]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg mb-4">Không tìm thấy bài viết.</p>
          <Button onClick={handleBack}>Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>

      <Card>
        <CardHeader>
          {authorInfo && (
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <UserAvatar
                src={authorInfo.avatarUrl}
                name={authorInfo.name}
                className="w-6 h-6"
              />
              <span>{authorInfo.name}</span>
              <span>•</span>
              <span>{authorInfo.createdAt}</span>
            </div>
          )}
          <CardTitle className="text-3xl font-bold text-center bg-clip-text capitalize">
            {post?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <article
            className="prose max-w-none ql-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Bình luận {meta.total > 0 && `(${meta.total})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Đang tải bình luận...</p>
            </div>
          ) : (
            <>
              <CommentList
                postId={post?.id}
                initial={comments}
                onCreate={handleCreateComment}
                onDelete={handleDeleteComment}
              />
              
              {meta.pages > 1 && (
                <div className="mt-6 pt-4 border-t">
                  <Pagination
                    base={1}
                    totalPages={meta.pages}
                    currentPage={page}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}