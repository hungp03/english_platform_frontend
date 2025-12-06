"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAdminInstructorRequests, getInstructorList } from "@/lib/api/instructor";
import { toast } from "sonner";
import { GraduationCap, Clock, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import InstructorRequestList from "@/components/admin/instructor-management/instructor-request-list";
import InstructorFilters from "@/components/admin/instructor-management/instructor-filters";
import InstructorListSection from "@/components/admin/instructor-management/instructor-list-section";
import InstructorListFilters from "@/components/admin/instructor-management/instructor-list-filters";

const PAGE_SIZE = 10;

const InstructorManagement = () => {
  const [activeTab, setActiveTab] = useState("requests");
  
  // Request states
  const [instructorRequests, setInstructorRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Instructor list states
  const [instructors, setInstructors] = useState([]);
  const [instructorPage, setInstructorPage] = useState(1);
  const [instructorTotalPages, setInstructorTotalPages] = useState(1);
  const [instructorSortField, setInstructorSortField] = useState("createdAt");
  const [instructorSortDir, setInstructorSortDir] = useState("asc");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [instructorDebouncedSearch, setInstructorDebouncedSearch] = useState("");
  const [instructorLoading, setInstructorLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 1000);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setInstructorDebouncedSearch(instructorSearch), 1000);
    return () => clearTimeout(timer);
  }, [instructorSearch]);

  const fetchInstructorRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { success, data } = await getAdminInstructorRequests(
        status === "all" ? null : status,
        page,
        PAGE_SIZE,
        sortDir
      );

      if (success && data) {
        setInstructorRequests(data.result ?? []);
        setTotalPages(data.meta?.pages ?? 1);
      }
    } catch (error) {
      console.error("[ERROR] Fetching instructor requests:", error);
      toast.error("Lấy danh sách yêu cầu giảng viên thất bại");
    } finally {
      setLoading(false);
    }
  }, [status, page, sortDir]);

  const fetchInstructors = useCallback(async () => {
    setInstructorLoading(true);
    try {
      const { success, data } = await getInstructorList(
        instructorPage,
        PAGE_SIZE,
        instructorSortField,
        instructorSortDir,
        instructorDebouncedSearch || null
      );

      if (success && data) {
        setInstructors(data.result ?? []);
        setInstructorTotalPages(data.meta?.pages ?? 1);
      }
    } catch (error) {
      console.error("[ERROR] Fetching instructors:", error);
      toast.error("Lấy danh sách giảng viên thất bại");
    } finally {
      setInstructorLoading(false);
    }
  }, [instructorPage, instructorSortField, instructorSortDir, instructorDebouncedSearch]);

  useEffect(() => {
    fetchInstructorRequests();
  }, [fetchInstructorRequests]);

  useEffect(() => {
    if (activeTab === "instructors") {
      fetchInstructors();
    }
  }, [activeTab, fetchInstructors]);

  // Filter client-side for search
  const filteredRequests = useMemo(() => {
    if (!debouncedSearch) return instructorRequests;

    const searchLower = debouncedSearch.toLowerCase();
    return instructorRequests.filter((request) =>
      request.user?.fullName?.toLowerCase().includes(searchLower) ||
      request.user?.email?.toLowerCase().includes(searchLower) ||
      request.qualification?.toLowerCase().includes(searchLower)
    );
  }, [instructorRequests, debouncedSearch]);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleSortToggle = useCallback(() => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    setPage(1);
  }, []);

  const handleInstructorSearchChange = useCallback((value) => {
    setInstructorSearch(value);
    setInstructorPage(1);
  }, []);

  const handleInstructorSortFieldChange = useCallback((value) => {
    setInstructorSortField(value);
    setInstructorPage(1);
  }, []);

  const handleInstructorSortDirToggle = useCallback(() => {
    setInstructorSortDir((d) => (d === "asc" ? "desc" : "asc"));
    setInstructorPage(1);
  }, []);

  const handleInstructorPageChange = useCallback((newPage) => {
    setInstructorPage(newPage);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý Giảng viên</h1>
            <p className="text-sm text-muted-foreground">
              Xét duyệt yêu cầu và quản lý danh sách giảng viên
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests" className="gap-2">
            <Clock className="h-4 w-4" />
            Yêu cầu đăng ký
          </TabsTrigger>
          <TabsTrigger value="instructors" className="gap-2">
            <Users className="h-4 w-4" />
            Danh sách giảng viên
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <InstructorFilters
            search={search}
            onSearchChange={handleSearchChange}
            status={status}
            onStatusChange={handleStatusChange}
            sortDir={sortDir}
            onSortToggle={handleSortToggle}
          />
          <Card>
            <CardHeader>
              <CardTitle>Danh sách yêu cầu</CardTitle>
              <CardDescription>
                {filteredRequests.length} yêu cầu được tìm thấy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstructorRequestList
                requests={filteredRequests}
                loading={loading}
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách giảng viên</CardTitle>
              <CardDescription>
                Quản lý tất cả giảng viên trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstructorListFilters
                search={instructorSearch}
                onSearchChange={handleInstructorSearchChange}
                sortField={instructorSortField}
                onSortFieldChange={handleInstructorSortFieldChange}
                sortDir={instructorSortDir}
                onSortDirToggle={handleInstructorSortDirToggle}
              />
              <InstructorListSection
                instructors={instructors}
                loading={instructorLoading}
                currentPage={instructorPage}
                totalPages={instructorTotalPages}
                onPageChange={handleInstructorPageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstructorManagement;