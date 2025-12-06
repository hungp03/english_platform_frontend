"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Search, ArrowUpDown, Users, Filter, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsers, toggleUserStatus } from "@/lib/api/user";
import { Pagination } from "@/components/ui/pagination";
import ConfirmModal from "@/components/admin/users/confirm-modal";
import UserList from "@/components/admin/users/user-list";
import { toast } from "sonner";

const PAGE_SIZE = 5;
const SKELETON_COUNT = 5;

const UsersHeader = memo(function UsersHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Users className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý tài khoản và quyền hạn người dùng
        </p>
      </div>
    </div>
  );
});

const UserFilters = memo(function UserFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortDir,
  onSortToggle
}) {
  const handleInputChange = useCallback((e) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="pl-10"
          value={search}
          onChange={handleInputChange}
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]">
          <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="active">Hoạt động</SelectItem>
          <SelectItem value="inactive">Tạm khóa</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onSortToggle}>
        <ArrowUpDown className="w-4 h-4 mr-2" />
        Ngày tạo ({sortDir === "DESC" ? "Mới nhất" : "Cũ nhất"})
      </Button>
    </div>
  );
});

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div key={index} className="border rounded-lg p-4 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <UserX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Không tìm thấy người dùng</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
      </p>
    </div>
  );
}

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("DESC");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalUser, setModalUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { success, data } = await getUsers({
        page,
        size: PAGE_SIZE,
        searchTerm: debouncedSearch,
        sortBy,
        sortDir,
      });

      if (success && data) {
        setUsers(data.result ?? []);
        setTotalPages(data.meta?.pages ?? 1);
        setTotalUsers(data.meta?.total ?? 0);
      }
    } catch (error) {
      console.error("[ERROR] Fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortBy, sortDir]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (status === "all") return users;
    const wantActive = status === "active";
    return users.filter((u) => !!u.isActive === wantActive);
  }, [users, status]);

  const handleToggle = useCallback((user) => setModalUser(user), []);
  const handleCloseModal = useCallback(() => setModalUser(null), []);

  const handleConfirmToggle = useCallback(async () => {
    if (!modalUser) return;
    try {
      const res = await toggleUserStatus(modalUser.id);
      if (res.success) {
        await fetchUsers();
      }
    } catch (error) {
      toast.error("Thay đổi trạng thái thất bại");
      console.error("[ERROR] Toggling user status:", error);
    } finally {
      setModalUser(null);
    }
  }, [modalUser, fetchUsers]);

  const handleSearchChange = useCallback((value) => {
    setPage(1);
    setSearch(value);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setPage(1);
    setStatus(value);
  }, []);

  const handleSortToggle = useCallback(() => {
    setPage(1);
    setSortDir((d) => (d === "ASC" ? "DESC" : "ASC"));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <UsersHeader />

      <UserFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        sortDir={sortDir}
        onSortToggle={handleSortToggle}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            {!loading && `${totalUsers} người dùng được tìm thấy`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton />
          ) : filteredUsers.length === 0 ? (
            <EmptyState />
          ) : (
            <UserList users={filteredUsers} onToggle={handleToggle} />
          )}

          {!loading && filteredUsers.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={!!modalUser}
        onClose={handleCloseModal}
        onConfirm={handleConfirmToggle}
        willLock={modalUser?.isActive ?? true}
      />
    </div>
  );
};

export default UserManagement;