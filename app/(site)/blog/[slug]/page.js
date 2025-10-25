"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicGetPostBySlug } from "@/lib/api/content/posts";
import {
  publicListCommentsByPost,
  appCreateComment,
} from "@/lib/api/content/comments";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CommentList from "@/components/content/comment-list";
import { sanitizeHtml } from "@/lib/sanitize";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load comments function
  async function loadComments(postId) {
    try {
      const cs = await publicListCommentsByPost(postId);
      const content = cs?.content ?? cs?.data?.result ?? cs?.data ?? cs;
      setComments(Array.isArray(content) ? content : []);
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments([]);
    }
  }

  // Handle comment creation
  async function handleCreateComment(payload) {
    if (!post?.id) return;
    try {
      await appCreateComment(post.id, payload);
      await loadComments(post.id);
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  }

  // Initial load
  useEffect(() => {
    async function init() {
      if (!slug) return;
      
      setIsLoading(true);
      try {
        const postData = await publicGetPostBySlug(slug);
        setPost(postData);
        
        if (postData?.id) {
          await loadComments(postData.id);
        }
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [slug]);

  if (isLoading) {
    return <div className="container mx-auto p-4">Đang tải...</div>;
  }

  if (!post) {
    return <div className="container mx-auto p-4">Không tìm thấy bài viết.</div>;
  }

  const html = sanitizeHtml(post.bodyMd || "");

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          {/* Author header */}
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <img 
              src={post.authorAvatarUrl || "/avatar.svg"} 
              className="w-6 h-6 rounded-full object-cover" 
              alt={post.authorName || "Avatar"}
            />
            <span>{post.authorName || "Ẩn danh"}</span>
            <span>•</span>
            <span>
              {post.createdAt 
                ? new Date(post.createdAt).toLocaleString("vi-VN") 
                : ""}
            </span>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-clip-text capitalize">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <article
            className="prose max-w-none ql-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bình luận</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentList
            postId={post.id}
            initial={comments}
            onCreate={handleCreateComment}
          />
        </CardContent>
      </Card>
    </div>
  );
}
