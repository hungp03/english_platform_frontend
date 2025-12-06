"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from "@/store/notification-store";
import NotificationItem from "./notification-item";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

export default function NotificationBell() {
  const { user } = useAuthStore();
  const { 
    notifications, 
    unreadCount, 
    loading,
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    removeNotification 
  } = useNotificationStore();
  
  const [isOpen, setIsOpen] = useState(false);

  // Fetch khi component mount nếu đã login
  useEffect(() => {
    if (user) {
      fetchNotifications(1);
    }
  }, [user]);

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 sm:w-96" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Thông báo</h4>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto px-2 text-xs"
              onClick={() => fetchNotifications(1)}
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto px-2 text-xs text-blue-600 hover:text-blue-700"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Đánh dấu đã đọc hết
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.slice(0, 10).map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  onRead={markAsRead}
                  onDelete={removeNotification}
                  compact={true}
                />
              ))}
              {notifications.length > 10 && (
                 <p className="py-4 text-center text-xs text-muted-foreground">
                    Và {notifications.length - 10} thông báo khác...
                 </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Bell className="mb-2 h-10 w-10 opacity-20" />
              <p>Không có thông báo nào</p>
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t p-2">
          <Button variant="outline" className="w-full justify-center" asChild onClick={() => setIsOpen(false)}>
            <Link href="/account/notifications">
              Xem tất cả
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}