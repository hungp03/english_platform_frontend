"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useNotificationStore } from "@/store/notification-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Trash2, Inbox, RefreshCw } from "lucide-react";
import NotificationItem from "@/components/notification/notification-item";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationsPage() {
  const { 
    notifications, 
    loading, 
    unreadCount,
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    removeAll,
    pagination
  } = useNotificationStore();

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (notifications.length === 0) {
      fetchNotifications(1);
    }
  }, []);

  const handlePageChange = useCallback((page) => {
    fetchNotifications(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchNotifications]);

  const handleRefresh = useCallback(() => {
    fetchNotifications(pagination.page);
  }, [fetchNotifications, pagination.page]);

  const handleRemoveAll = useCallback(() => {
    if(confirm("Bạn có chắc chắn muốn xóa toàn bộ thông báo?")) {
      removeAll();
    }
  }, [removeAll]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filter === "unread") return !n.isRead;
      if (filter === "read") return n.isRead;
      return true;
    });
  }, [notifications, filter]);

  return (
    <div className="container mx-auto max-w-5xl py-6 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Bell className="h-7 w-7 text-blue-600" />
              </div>
              Thông báo
            </h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : "Tất cả thông báo đã được đọc"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Tải mới</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead} 
              disabled={unreadCount === 0}
              className="hidden sm:flex"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Đọc tất cả
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRemoveAll} 
              disabled={notifications.length === 0}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Xóa tất cả</span>
            </Button>
          </div>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              <Inbox className="h-4 w-4" />
              Tất cả ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              <Bell className="h-4 w-4" />
              Chưa đọc ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read" className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Đã đọc ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading && notifications.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground">Đang tải thông báo...</p>
          </div>
        </Card>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-2">
          {filteredNotifications.map((item, index) => (
            <div 
              key={item.id}
              className="animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              <NotificationItem
                item={item}
                onRead={markAsRead}
                onDelete={removeNotification}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-6 rounded-full mb-6">
              <Bell className="h-16 w-16 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {filter === "unread" ? "Không có thông báo chưa đọc" : 
               filter === "read" ? "Không có thông báo đã đọc" : 
               "Bạn chưa có thông báo nào"}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {filter === "all" && "Các cập nhật về khóa học, bài tập và hệ thống sẽ xuất hiện ở đây."}
            </p>
          </div>
        </Card>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
