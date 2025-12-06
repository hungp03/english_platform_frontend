"use client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThreadEditForm from "@/components/forum/thread-edit-form";

export default function ForumEditThreadPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;

  return (
    <div className="container mx-auto p-4 space-y-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>
      <ThreadEditForm slug={slug} />
    </div>
  );
}