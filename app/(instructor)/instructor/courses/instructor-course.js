"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  Plus,
  BookOpen,
  Inbox,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import CourseCard from "@/components/instructor/courses/course-card";
import CourseDeleteDialog from "@/components/instructor/courses/course-delete-dialog";
import { Pagination } from "@/components/ui/pagination";
import { getCourses, deleteCourse } from "@/lib/api/course";

const SORT_OPTIONS = [
  { value: "title,asc", label: "Tên (A → Z)" },
  { value: "title,desc", label: "Tên (Z → A)" },
  { value: "createdAt,desc", label: "Mới nhất" },
  { value: "createdAt,asc", label: "Cũ nhất" },
  { value: "updatedAt,desc", label: "Cập nhật gần đây" },
  { value: "updatedAt,asc", label: "Cập nhật lâu nhất" },
];

const PageHeader = memo(function PageHeader({ onCreateNew }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Quản lý khóa học</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Tạo và quản lý các khóa học của bạn
          </p>
        </div>
      </div>
      <Button onClick={onCreateNew} className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        Tạo khóa học mới
      </Button>
    </div>
  );
});

const Filters = memo(function Filters({
  searchTerm,
  onSearchChange,
  sortOption,
  onSortChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm khóa học..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={sortOption} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <ArrowUpDown className="h-4 w-4 mr-2 flex-shrink-0" />
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ onCreateNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
        <Inbox className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Chưa có khóa học nào</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Bắt đầu tạo khóa học đầu tiên của bạn để chia sẻ kiến thức với học viên
      </p>
      <Button onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Tạo khóa học đầu tiên
      </Button>
    </div>
  );
}

function NoResults() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Không tìm thấy kết quả</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
      </p>
    </div>
  );
}

export default function InstructorCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("createdAt,desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const mounted = useRef(false);
  const deletingRef = useRef(false);
  const debounceTimer = useRef(null);
  const currentFetchKey = useRef("");

  const fetchCourses = useCallback(async (params) => {
    const key = JSON.stringify(params);
    if (key === currentFetchKey.current) return;
    currentFetchKey.current = key;

    try {
      setLoading(true);
      const res = await getCourses(params);
      const data = res?.data || {};
      const meta = data?.meta || {};
      setCourses(data?.result || []);
      setTotalPages(meta?.pages || 1);
      setTotalCourses(meta?.total || 0);
    } catch (err) {
      console.error("API error:", err);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    fetchCourses({ page: 1, size: 6, sort: sortOption });
  }, [fetchCourses, sortOption]);

  useEffect(() => {
    if (!mounted.current) return;
    fetchCourses({ page, size: 6, sort: sortOption, keyword: searchTerm || undefined });
  }, [page, fetchCourses, sortOption, searchTerm]);

  const handleSortChange = useCallback((value) => {
    setSortOption(value);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setHasSearched(true);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
    }, 500);
  }, []);

  const handleCreateNew = useCallback(() => {
    router.push("/instructor/courses/new");
  }, [router]);

  const handleEdit = useCallback((course) => {
    router.push(`/instructor/courses/${course.id}/edit`);
  }, [router]);

  const handleDelete = useCallback((course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deletingRef.current || !selectedCourse?.id) return;
    deletingRef.current = true;

    try {
      const res = await deleteCourse(selectedCourse.id);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id));
        if (courses.length === 1 && page > 1) {
          setPage((p) => p - 1);
        }
        toast.success(`Đã xóa khóa học "${selectedCourse.title}"`);
      } else {
        toast.error(res.error || "Không thể xóa khóa học");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa khóa học");
    } finally {
      setDeleteDialogOpen(false);
      deletingRef.current = false;
    }
  }, [selectedCourse, courses.length, page]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full bg-background">
      <PageHeader onCreateNew={handleCreateNew} />

      <Filters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        sortOption={sortOption}
        onSortChange={handleSortChange}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : courses.length === 0 ? (
        hasSearched || searchTerm ? (
          <NoResults />
        ) : (
          <EmptyState onCreateNew={handleCreateNew} />
        )
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {totalCourses > 0 && `${totalCourses} khóa học`}
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pt-4 flex justify-center">
              <Pagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {selectedCourse && (
        <CourseDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          course={selectedCourse}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
