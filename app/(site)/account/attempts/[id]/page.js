"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AttemptAnswersView from "@/components/assessment/attempt-answers-view";
import { getAttemptAnswers } from "@/lib/api/attempt";
import { useParams, useRouter } from "next/navigation";

export default function AttemptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAttemptAnswers(id);
        if (mounted) {
          if (res.success) {
            const attemptData = res.data;
            const skill = attemptData?.skill?.toUpperCase();
            
            if (skill === 'WRITING' || skill === 'SPEAKING') {
              setRedirecting(true);
              setTimeout(() => {
                if (mounted) router.push('/');
              }, 3000);
              return;
            }
            
            setData(attemptData);
          } else {
            setRedirecting(true);
            setTimeout(() => {
              if (mounted) router.push('/');
            }, 3000);
          }
        }
      } catch (e) {
        if (mounted) {
          setRedirecting(true);
          setTimeout(() => {
            if (mounted) router.push('/');
          }, 3000);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="container mx-auto max-w-5xl p-4 sm:p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg font-medium">Không tìm thấy dữ liệu</p>
              <p className="text-sm text-muted-foreground mt-2">Đang chuyển về trang chủ...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-5xl p-4 sm:p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <p className="text-destructive text-lg font-medium">{String(error)}</p>
              <Link href="/account">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại tài khoản
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto max-w-5xl p-4 sm:p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Không có dữ liệu.</p>
              <Link href="/account">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại tài khoản
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quizId = data?.quizId;

  return (
    <div className="container mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link href="/account">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại tài khoản
          </Button>
        </Link>

        {quizId && (
          <Link href={`/practice/${quizId}`}>
            <Button variant="default" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Làm lại bài
            </Button>
          </Link>
        )}
      </div>

      <AttemptAnswersView data={data} />
    </div>
  );
}
