"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublicInstructorOverview, getPublicInstructorCourses } from "@/lib/api/instructor";
import { CoursesGrid } from "@/components/courses";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { FullPageLoader } from "@/components/ui/full-page-loader";

const DEFAULT_PAGE_SIZE = 12;

export default function InstructorPublicPage() {
  const { userId } = useParams();
  const [bootLoading, setBootLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: DEFAULT_PAGE_SIZE, pages: 1, total: 0 });

  const handlePageChange = useCallback(async (nextPage) => {
    setCoursesLoading(true);
    const res = await getPublicInstructorCourses(userId, { page: nextPage, pageSize: meta.pageSize });
    if (res.success) {
      const payload = res.data;
      setCourses(payload?.result || payload?.courses?.result || []);
      setMeta(payload?.meta || payload?.courses?.meta || { page: nextPage, pageSize: meta.pageSize, pages: meta.pages, total: meta.total });
      setError(null);
    } else {
      setError(res.error || "Không thể tải danh sách khoá học");
    }
    setCoursesLoading(false);
  }, [userId, meta.pageSize, meta.pages, meta.total]);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      setBootLoading(true);
      try {
        const [ovRes, crRes] = await Promise.all([
          getPublicInstructorOverview(userId),
          getPublicInstructorCourses(userId, { page: 1, pageSize: DEFAULT_PAGE_SIZE })
        ]);

        if (!mounted) return;

        if (ovRes.success) {
          setProfile(ovRes.data?.profile || null);
          setStats(ovRes.data?.stats || null);
        } else {
          setError(ovRes.error || "Không thể tải thông tin giảng viên");
        }

        if (crRes.success) {
          const payload = crRes.data;
          setCourses(payload?.result || payload?.courses?.result || []);
          setMeta(payload?.meta || payload?.courses?.meta || { page: 1, pageSize: DEFAULT_PAGE_SIZE, pages: 1, total: 0 });
        } else {
          setError(crRes.error || "Không thể tải danh sách khoá học");
        }
      } catch (e) {
        if (mounted) setError(e?.message || "Lỗi không xác định");
      } finally {
        if (mounted) setBootLoading(false);
      }
    }
    if (userId) bootstrap();
    return () => { mounted = false; };
  }, [userId, handlePageChange]);

  const avatarSrc = useMemo(() => profile?.avatarUrl || "/default-avatar.png", [profile?.avatarUrl]);

  if (bootLoading) return <FullPageLoader />;
  if (error && !courses.length) return <div className="container mx-auto p-6">Lỗi: {error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex gap-6 items-center mb-8">
          <div className="relative w-28 h-28 rounded-full overflow-hidden bg-muted shrink-0">
            <Image src={avatarSrc} alt={profile?.fullName || "Instructor"} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{profile?.fullName}</h1>
            {profile?.expertise ? <p className="text-muted-foreground mt-1">Chuyên môn: {profile.expertise}</p> : null}
            <div className="flex gap-3 mt-3 text-sm text-muted-foreground">
              <span><strong>{stats?.publishedCourses ?? 0}</strong> khóa học</span>
              <span><strong>{stats?.totalStudents ?? 0}</strong> học viên</span>
              {/* {typeof stats?.formattedRevenue === "string" ? <span><strong>{stats.formattedRevenue}</strong> doanh thu</span> : null} */}
            </div>
          </div>
        </div>

        {/* Bio & Qualification */}
        {(profile?.bio || profile?.qualification || profile?.experienceYears) && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-3">Giới thiệu</h2>
            {profile?.bio ? <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: profile.bio }} /> : null}
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-2">
              {profile?.experienceYears ? <Badge variant="secondary">Kinh nghiệm: {profile.experienceYears} năm</Badge> : null}
              {profile?.qualification ? <Badge variant="outline">Chứng chỉ: {profile.qualification}</Badge> : null}
            </div>
          </div>
        )}

        {/* Courses */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Khóa học của {profile?.fullName}</h2>
          <Link href="/courses" className="text-sm text-primary hover:underline">Xem tất cả khóa học</Link>
        </div>

        <div className="relative">
          {coursesLoading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-10">
              <span className="text-sm text-muted-foreground">Đang tải danh sách khoá học…</span>
            </div>
          )}
          {courses?.length ? <CoursesGrid courses={courses} /> : <div className="text-muted-foreground">Chưa có khóa học nào.</div>}
        </div>

        {meta.pages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination totalPages={meta.pages || 1} currentPage={meta.page || 1} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
}